import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cryptomusAPI } from '@/lib/cryptomus';

export async function POST(request: NextRequest) {
  try {
    const { withdrawal_id, action, admin_id } = await request.json();

    // Валидация
    if (!withdrawal_id || !action || !admin_id) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Invalid action' },
        { status: 400 }
      );
    }

    // Получаем данные о выводе
    const withdrawalResult = await db.query(
      `SELECT w.*, u.telegram_id
       FROM withdrawals w
       JOIN users u ON w.user_id = u.id
       WHERE w.id = $1 AND w.status = 'pending'`,
      [withdrawal_id]
    );

    if (withdrawalResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Withdrawal not found or already processed' },
        { status: 404 }
      );
    }

    const withdrawal = withdrawalResult.rows[0];

    if (action === 'reject') {
      // Отклоняем вывод и возвращаем средства
      await db.transaction(async (client) => {
        // Обновляем статус вывода
        await client.query(
          'UPDATE withdrawals SET status = $1, processed_at = NOW(), updated_at = NOW() WHERE id = $2',
          ['rejected', withdrawal_id]
        );

        // Возвращаем средства на баланс
        await client.query(
          `UPDATE users_balance
           SET available = available + $1, locked = locked - $1, updated_at = NOW()
           WHERE user_id = $2 AND currency = $3`,
          [withdrawal.amount, withdrawal.user_id, 'USDT']
        );

        // Записываем в ledger возврат средств
        await client.query(
          `INSERT INTO ledger_entries
           (user_id, currency, entry_type, amount, balance_available_delta, balance_locked_delta, related_withdrawal_id, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
          [withdrawal.user_id, 'USDT', 'withdrawal_out', withdrawal.amount, withdrawal.amount, -withdrawal.amount, withdrawal_id]
        );

        // Логируем действие админа
        await client.query(
          `INSERT INTO audit_log
           (actor_admin_id, action, target_type, target_id, metadata, created_at)
           VALUES ($1, $2, $3, $4, $5, NOW())`,
          [admin_id, 'withdrawal_rejected', 'withdrawal', withdrawal_id, JSON.stringify({ amount: withdrawal.amount, address: withdrawal.address })]
        );
      });

      return NextResponse.json({
        success: true,
        data: { status: 'rejected', message: 'Withdrawal rejected and funds returned to user' }
      });
    }

    // Одобряем вывод и отправляем через Cryptomus
    try {
      await db.query(
        'UPDATE withdrawals SET status = $1, updated_at = NOW() WHERE id = $2',
        ['approved', withdrawal_id]
      );

      // Создаем выплату в Cryptomus
      const cryptomusResponse = await cryptomusAPI.createPayout({
        amount: withdrawal.amount.toString(),
        currency: 'USDT',
        order_id: withdrawal.provider_order_id,
        address: withdrawal.address,
        network: withdrawal.network_code,
        is_subtract: true, // Комиссия с нашего баланса
        url_callback: process.env.CRYPTOMUS_PAYOUT_WEBHOOK_URL,
      });

      if (cryptomusResponse.state !== 0) {
        throw new Error(cryptomusResponse.message || 'Failed to create payout');
      }

      // Обновляем данные вывода
      await db.query(
        `UPDATE withdrawals SET
         status = $1,
         provider_uuid = $2,
         payer_currency = $3,
         payer_amount = $4,
         is_subtract = $5,
         processed_at = NOW(),
         updated_at = NOW()
         WHERE id = $6`,
        [
          'processing',
          cryptomusResponse.result?.uuid,
          cryptomusResponse.result?.payer_currency,
          cryptomusResponse.result?.payer_amount,
          true,
          withdrawal_id
        ]
      );

      // Логируем вызов API
      await db.query(
        `INSERT INTO provider_call_logs
         (provider, endpoint, http_method, request_body, response_body, status_code, related_withdrawal_id, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
        [
          'cryptomus',
          '/payout',
          'POST',
          JSON.stringify({
            amount: withdrawal.amount,
            currency: 'USDT',
            order_id: withdrawal.provider_order_id,
            address: withdrawal.address,
            network: withdrawal.network_code
          }),
          JSON.stringify(cryptomusResponse),
          200,
          withdrawal_id
        ]
      );

      // Логируем действие админа
      await db.query(
        `INSERT INTO audit_log
         (actor_admin_id, action, target_type, target_id, metadata, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [admin_id, 'withdrawal_approved', 'withdrawal', withdrawal_id, JSON.stringify({
          amount: withdrawal.amount,
          address: withdrawal.address,
          cryptomus_uuid: cryptomusResponse.result?.uuid
        })]
      );

      return NextResponse.json({
        success: true,
        data: {
          status: 'processing',
          cryptomus_uuid: cryptomusResponse.result?.uuid,
          message: 'Withdrawal approved and sent to Cryptomus'
        }
      });

    } catch (cryptomusError: unknown) {
      console.error('Cryptomus payout error:', cryptomusError);

      // Откатываем статус и возвращаем средства
      await db.transaction(async (client) => {
        await client.query(
          'UPDATE withdrawals SET status = $1, updated_at = NOW() WHERE id = $2',
          ['failed', withdrawal_id]
        );

        await client.query(
          `UPDATE users_balance
           SET available = available + $1, locked = locked - $1, updated_at = NOW()
           WHERE user_id = $2 AND currency = $3`,
          [withdrawal.amount, withdrawal.user_id, 'USDT']
        );

        await client.query(
          `INSERT INTO ledger_entries
           (user_id, currency, entry_type, amount, balance_available_delta, balance_locked_delta, related_withdrawal_id, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
          [withdrawal.user_id, 'USDT', 'withdrawal_out', withdrawal.amount, withdrawal.amount, -withdrawal.amount, withdrawal_id]
        );
      });

      return NextResponse.json(
        { success: false, error: 'Failed to process withdrawal through Cryptomus' },
        { status: 500 }
      );
    }

  } catch (error: unknown) {
    console.error('Withdrawal processing error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
