import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cryptomusAPI } from '@/lib/cryptomus';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const { amount, network, user_id } = await request.json();

    // Валидация входных данных
    if (!amount || !network || !user_id) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (parseFloat(amount) < 10) {
      return NextResponse.json(
        { success: false, error: 'Minimum amount is 10 USDT' },
        { status: 400 }
      );
    }

    // Проверяем существование пользователя
    const userResult = await db.query(
      'SELECT id FROM users WHERE telegram_id = $1',
      [user_id]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const userId = userResult.rows[0].id;
    const orderId = `deposit_${userId}_${Date.now()}`;

    // Создаем запись депозита в БД
    const depositResult = await db.query(
      `INSERT INTO deposits
       (user_id, currency, amount, status, provider, provider_order_id, network_code, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
       RETURNING id`,
      [userId, 'USDT', amount, 'pending', 'cryptomus', orderId, network]
    );

    const depositId = depositResult.rows[0].id;

    try {
      // Создаем платеж в Cryptomus
      const cryptomusResponse = await cryptomusAPI.createPayment({
        amount: amount,
        currency: 'USDT',
        order_id: orderId,
        network: network,
        url_callback: process.env.CRYPTOMUS_PAYMENT_WEBHOOK_URL,
        lifetime: 3600, // 1 час
      });

      if (cryptomusResponse.state !== 0) {
        throw new Error(cryptomusResponse.message || 'Failed to create payment');
      }

      // Обновляем запись депозита с данными от Cryptomus
      await db.query(
        `UPDATE deposits SET
         provider_uuid = $1,
         address = $2,
         url = $3,
         expired_at = $4,
         payment_status = $5,
         updated_at = NOW()
         WHERE id = $6`,
        [
          cryptomusResponse.result?.uuid,
          cryptomusResponse.result?.address,
          cryptomusResponse.result?.url,
          cryptomusResponse.result?.expired_at ? new Date(cryptomusResponse.result.expired_at * 1000) : null,
          cryptomusResponse.result?.status,
          depositId
        ]
      );

      // Логируем вызов API
      await db.query(
        `INSERT INTO provider_call_logs
         (provider, endpoint, http_method, request_body, response_body, status_code, related_deposit_id, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
        [
          'cryptomus',
          '/payment',
          'POST',
          JSON.stringify({ amount, currency: 'USDT', order_id: orderId, network }),
          JSON.stringify(cryptomusResponse),
          200,
          depositId
        ]
      );

      return NextResponse.json({
        success: true,
        data: {
          deposit_id: depositId,
          order_id: orderId,
          amount: amount,
          network: network,
          address: cryptomusResponse.result?.address,
          payment_url: cryptomusResponse.result?.url,
          expires_at: cryptomusResponse.result?.expired_at ? new Date(cryptomusResponse.result.expired_at * 1000).toISOString() : null,
          status: cryptomusResponse.result?.status,
        }
      });

    } catch (cryptomusError: unknown) {
      // Обновляем статус депозита как failed
      await db.query(
        'UPDATE deposits SET status = $1, updated_at = NOW() WHERE id = $2',
        ['failed', depositId]
      );

      console.error('Cryptomus API error:', cryptomusError);

      return NextResponse.json(
        { success: false, error: 'Failed to create payment. Please try again.' },
        { status: 500 }
      );
    }

  } catch (error: unknown) {
    console.error('Deposit creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
