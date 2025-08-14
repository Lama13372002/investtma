import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { BalanceDBResult, InvestmentDBResult } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');

    if (!user_id) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Получаем user_id из базы по telegram_id
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

    // Получаем баланс пользователя
    const balanceResult = await db.query(
      'SELECT * FROM users_balance WHERE user_id = $1 AND currency = $2',
      [userId, 'USDT']
    );

    let balance = {
      available: 0,
      bonus: 0,
      locked: 0
    };

    if (balanceResult.rows.length > 0) {
      const row = balanceResult.rows[0] as unknown as BalanceDBResult;
      balance = {
        available: parseFloat(row.available),
        bonus: parseFloat(row.bonus),
        locked: parseFloat(row.locked)
      };
    }

    // Получаем активные инвестиции
    const investmentsResult = await db.query(
      `SELECT SUM(amount) as total_invested
       FROM investments
       WHERE user_id = $1 AND status = $2`,
      [userId, 'active']
    );

    const totalInvested = (investmentsResult.rows[0] as unknown as InvestmentDBResult)?.amount || '0';

    return NextResponse.json({
      success: true,
      data: {
        available: balance.available,
        bonus: balance.bonus,
        locked: balance.locked,
        total_invested: parseFloat(totalInvested),
        total_balance: balance.available + balance.bonus + parseFloat(totalInvested)
      }
    });

  } catch (error: unknown) {
    console.error('Balance fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
