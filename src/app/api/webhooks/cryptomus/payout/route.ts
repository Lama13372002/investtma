import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cryptomusAPI, CryptomusWebhookPayout } from '@/lib/cryptomus';
import { WithdrawalDBResult } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const webhookData: CryptomusWebhookPayout = await request.json();

    // Проверяем подпись webhook
    if (!cryptomusAPI.verifyWebhookSignature(webhookData, webhookData.sign, false)) {
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
      ['cryptomus', 'payout', webhookData.uuid, JSON.stringify(webhookData), 'pending']
    );

    // Находим вывод по order_id
    const withdrawalResult = await db.query(
      'SELECT * FROM withdrawals WHERE provider_order_id = $1 AND provider = $2',
      [webhookData.order_id, 'cryptomus']
    );

    if (withdrawalResult.rows.length === 0) {
      console.error('Withdrawal not found for order_id:', webhookData.order_id);
      return NextResponse.json(
        { success: false, error: 'Withdrawal not found' },
        { status: 404 }
      );
    }

    const withdrawal = withdrawalResult.rows[0] as unknown as WithdrawalDBResult;

    // Маппинг статусов Cryptomus к нашим статусам
    const statusMapping: { [key: string]: string } = {
      'process': 'processing',
      'check': 'processing',
      'paid': 'completed',
      'fail': 'failed',
      'cancel': 'failed',
      'system_fail': 'failed'
    };

    const newStatus = statusMapping[webhookData.status] || 'processing';
    const payoutAmount = parseFloat(webhookData.amount);
    const merchantAmount = parseFloat(webhookData.merchant_amount);
    const commission = parseFloat(webhookData.commission);

    try {
      await db.transaction(async (client) => {
        // Обновляем вывод
        await client.query(
          `UPDATE withdrawals SET
           status = $1,
           provider_tx_id = $2,
           txid = $3,
           payer_amount = $4,
           is_final = $5,
           processed_at = $6,
           updated_at = NOW()
           WHERE id = $7`,
          [
            newStatus,
            webhookData.txid,
            webhookData.txid,
            webhookData.payer_amount,
            webhookData.is_final,
            webhookData.is_final ? new Date() : withdrawal.processed_at,
            withdrawal.id
          ]
        );

        // Если вывод завершен (успешно или неуспешно), обновляем баланс
        if (webhookData.is_final) {
          if (newStatus === 'completed') {
            // Успешный вывод - убираем заблокированные средства и записываем комиссию
            await client.query(
              `UPDATE users_balance
               SET locked = locked - $1, updated_at = NOW()
               WHERE user_id = $2 AND currency = $3`,
              [withdrawal.amount, withdrawal.user_id, 'USDT']
            );

            // Записываем в ledger фактический вывод
            await client.query(
              `INSERT INTO ledger_entries
               (user_id, currency, entry_type, amount, balance_available_delta, balance_bonus_delta, balance_locked_delta, related_withdrawal_id, idempotency_key, created_at)
               VALUES ($1, $2, $3, $4, 0, 0, $5, $6, $7, NOW())`,
              [
                withdrawal.user_id,
                'USDT',
                'withdrawal_out',
                withdrawal.amount,
                -withdrawal.amount,
                withdrawal.id,
                `withdrawal_${withdrawal.id}_${webhookData.uuid}`
              ]
            );

            // Записываем комиссию, если есть
            if (parseFloat(withdrawal.fee || '0') > 0) {
              await client.query(
                `INSERT INTO ledger_entries
                 (user_id, currency, entry_type, amount, balance_available_delta, balance_bonus_delta, balance_locked_delta, related_withdrawal_id, created_at)
                 VALUES ($1, $2, $3, $4, 0, 0, 0, $5, NOW())`,
                [
                  withdrawal.user_id,
                  'USDT',
                  'withdrawal_fee',
                  withdrawal.fee,
                  withdrawal.id
                ]
              );
            }

          } else if (newStatus === 'failed') {
            // Неуспешный вывод - возвращаем средства на доступный баланс
            await client.query(
              `UPDATE users_balance
               SET available = available + $1, locked = locked - $1, updated_at = NOW()
               WHERE user_id = $2 AND currency = $3`,
              [withdrawal.amount, withdrawal.user_id, 'USDT']
            );

            // Записываем в ledger возврат средств
            await client.query(
              `INSERT INTO ledger_entries
               (user_id, currency, entry_type, amount, balance_available_delta, balance_bonus_delta, balance_locked_delta, related_withdrawal_id, idempotency_key, created_at)
               VALUES ($1, $2, $3, $4, $5, 0, $6, $7, $8, NOW())`,
              [
                withdrawal.user_id,
                'USDT',
                'withdrawal_out',
                withdrawal.amount,
                withdrawal.amount,
                -withdrawal.amount,
                withdrawal.id,
                `withdrawal_failed_${withdrawal.id}_${webhookData.uuid}`
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

      console.log(`Payout webhook processed successfully for order ${webhookData.order_id}, status: ${webhookData.status}`);

      return NextResponse.json({ success: true });

    } catch (dbError: unknown) {
      console.error('Database error processing payout webhook:', dbError);

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
    console.error('Payout webhook error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
