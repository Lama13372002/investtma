import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { amount, address, network, user_id } = await request.json();

    // Валидация входных данных
    if (!amount || !address || !network || !user_id) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (parseFloat(amount) < 10) {
      return NextResponse.json(
        { success: false, error: 'Minimum withdrawal amount is 10 USDT' },
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

    // Проверяем баланс пользователя
    const balanceResult = await db.query(
      'SELECT available FROM users_balance WHERE user_id = $1 AND currency = $2',
      [userId, 'USDT']
    );

    if (balanceResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No balance found' },
        { status: 400 }
      );
    }

    const availableBalance = parseFloat(balanceResult.rows[0].available);
    const withdrawalAmount = parseFloat(amount);

    if (availableBalance < withdrawalAmount) {
      return NextResponse.json(
        { success: false, error: 'Insufficient balance' },
        { status: 400 }
      );
    }

    // Определяем комиссию в зависимости от сети
    const networkFees: { [key: string]: number } = {
      'TRON': 1.70,
      'BSC': 0.30,
      'ETH': 10.00,
      'POLYGON': 0.01
    };

    const fee = networkFees[network] || 1.70;
    const orderId = `withdrawal_${userId}_${Date.now()}`;

    // Создаем транзакцию для блокировки средств и создания запроса на вывод
    await db.transaction(async (client) => {
      // Блокируем средства на балансе пользователя
      await client.query(
        `UPDATE users_balance
         SET available = available - $1, locked = locked + $1, updated_at = NOW()
         WHERE user_id = $2 AND currency = $3`,
        [withdrawalAmount, userId, 'USDT']
      );

      // Создаем запись о блокировке в ledger
      await client.query(
        `INSERT INTO ledger_entries
         (user_id, currency, entry_type, amount, balance_available_delta, balance_locked_delta, idempotency_key, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
        [userId, 'USDT', 'withdrawal_lock', withdrawalAmount, -withdrawalAmount, withdrawalAmount, orderId]
      );

      // Создаем запись вывода
      await client.query(
        `INSERT INTO withdrawals
         (user_id, currency, amount, address, fee, status, network_code, provider, provider_order_id, requested_at, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW(), NOW())`,
        [userId, 'USDT', withdrawalAmount, address, fee, 'pending', network, 'cryptomus', orderId]
      );
    });

    return NextResponse.json({
      success: true,
      data: {
        order_id: orderId,
        amount: withdrawalAmount,
        address: address,
        network: network,
        fee: fee,
        status: 'pending',
        message: 'Withdrawal request created. It will be processed by admin within 24 hours.'
      }
    });

  } catch (error: any) {
    console.error('Withdrawal creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
