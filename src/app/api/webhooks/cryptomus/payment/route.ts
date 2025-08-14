import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cryptomusAPI, CryptomusWebhookPayment } from '@/lib/cryptomus';

export async function POST(request: NextRequest) {
  try {
    const webhookData: CryptomusWebhookPayment = await request.json();

    // Проверяем подпись webhook
    if (!cryptomusAPI.verifyWebhookSignature(webhookData, webhookData.sign, true)) {
      console.error('Invalid webhook signature');
      return NextResponse.json(
        { success: false, error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Логируем входящий webhook
    await db.query(
      `INSERT INTO inbound_webhooks
       (source, event_type, external_id, payload, received_at, processing_status)
       VALUES ($1, $2, $3, $4, NOW(), $5)`,
      ['cryptomus', 'payment', webhookData.uuid, JSON.stringify(webhookData), 'pending']
    );

    // Находим депозит по order_id
    const depositResult = await db.query(
      'SELECT * FROM deposits WHERE provider_order_id = $1 AND provider = $2',
      [webhookData.order_id, 'cryptomus']
    );

    if (depositResult.rows.length === 0) {
      console.error('Deposit not found for order_id:', webhookData.order_id);
      return NextResponse.json(
        { success: false, error: 'Deposit not found' },
        { status: 404 }
      );
    }

    const deposit = depositResult.rows[0];

    // Маппинг статусов Cryptomus к нашим статусам
    const statusMapping: { [key: string]: string } = {
      'paid': 'confirmed',
      'paid_over': 'confirmed',
      'wrong_amount': 'confirmed', // Частичная оплата тоже засчитывается
      'cancel': 'expired',
      'fail': 'failed',
      'system_fail': 'failed'
    };

    const newStatus = statusMapping[webhookData.status] || 'pending';
    const paymentAmount = parseFloat(webhookData.payment_amount);
    const merchantAmount = parseFloat(webhookData.merchant_amount);

    try {
      await db.transaction(async (client) => {
        // Обновляем депозит
        await client.query(
          `UPDATE deposits SET
           status = $1,
           payment_status = $2,
           merchant_amount = $3,
           payer_amount = $4,
           payer_currency = $5,
           from_address = $6,
           provider_tx_id = $7,
           confirmed_at = $8,
           updated_at = NOW()
           WHERE id = $9`,
          [
            newStatus,
            webhookData.status,
            merchantAmount,
            paymentAmount,
            webhookData.payer_currency,
            webhookData.from,
            webhookData.txid,
            webhookData.is_final && newStatus === 'confirmed' ? new Date() : null,
            deposit.id
          ]
        );

        // Если платеж подтвержден, зачисляем средства на баланс
        if (newStatus === 'confirmed' && merchantAmount > 0) {
          // Проверяем, не зачислены ли уже средства
          const existingLedgerEntry = await client.query(
            'SELECT id FROM ledger_entries WHERE related_deposit_id = $1 AND entry_type = $2',
            [deposit.id, 'deposit_in']
          );

          if (existingLedgerEntry.rows.length === 0) {
            // Зачисляем средства на баланс пользователя
            await client.query(
              `INSERT INTO users_balance (user_id, currency, available, bonus, locked, updated_at)
               VALUES ($1, $2, $3, 0, 0, NOW())
               ON CONFLICT (user_id) DO UPDATE SET
               available = users_balance.available + EXCLUDED.available,
               updated_at = NOW()`,
              [deposit.user_id, 'USDT', merchantAmount]
            );

            // Записываем в ledger
            await client.query(
              `INSERT INTO ledger_entries
               (user_id, currency, entry_type, amount, balance_available_delta, balance_bonus_delta, balance_locked_delta, related_deposit_id, idempotency_key, created_at)
               VALUES ($1, $2, $3, $4, $5, 0, 0, $6, $7, NOW())`,
              [
                deposit.user_id,
                'USDT',
                'deposit_in',
                merchantAmount,
                merchantAmount,
                deposit.id,
                `deposit_${deposit.id}_${webhookData.uuid}`
              ]
            );
          }
        }

        // Обновляем статус обработки webhook
        await client.query(
          `UPDATE inbound_webhooks
           SET processing_status = $1, processed_at = NOW()
           WHERE external_id = $2 AND source = $3`,
          ['processed', webhookData.uuid, 'cryptomus']
        );
      });

      console.log(`Payment webhook processed successfully for order ${webhookData.order_id}, status: ${webhookData.status}`);

      return NextResponse.json({ success: true });

    } catch (dbError: unknown) {
      console.error('Database error processing payment webhook:', dbError);

      // Обновляем статус обработки webhook как failed
      await db.query(
        `UPDATE inbound_webhooks
         SET processing_status = $1, processed_at = NOW()
         WHERE external_id = $2 AND source = $3`,
        ['failed', webhookData.uuid, 'cryptomus']
      );

      return NextResponse.json(
        { success: false, error: 'Database error' },
        { status: 500 }
      );
    }

  } catch (error: unknown) {
    console.error('Payment webhook error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
