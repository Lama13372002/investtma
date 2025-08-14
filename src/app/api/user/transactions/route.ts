import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

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

    // Получаем депозиты
    const depositsResult = await db.query(
      `SELECT
         'deposit' as type,
         id,
         amount,
         status,
         network_code as network,
         provider_tx_id as tx_hash,
         created_at as date,
         0 as fee
       FROM deposits
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    // Получаем выводы
    const withdrawalsResult = await db.query(
      `SELECT
         'withdrawal' as type,
         id,
         amount,
         status,
         network_code as network,
         txid as tx_hash,
         created_at as date,
         fee
       FROM withdrawals
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    // Объединяем и сортируем транзакции
    const transactions = [
      ...depositsResult.rows,
      ...withdrawalsResult.rows
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
     .slice(offset, offset + limit);

    // Форматируем транзакции
    const formattedTransactions = transactions.map(tx => ({
      id: tx.id,
      type: tx.type,
      amount: parseFloat(tx.amount),
      status: tx.status,
      network: tx.network,
      tx_hash: tx.tx_hash,
      date: new Date(tx.date).toISOString(),
      fee: tx.fee ? parseFloat(tx.fee) : 0
    }));

    return NextResponse.json({
      success: true,
      data: {
        transactions: formattedTransactions,
        total: depositsResult.rows.length + withdrawalsResult.rows.length,
        limit,
        offset
      }
    });

  } catch (error: any) {
    console.error('Transactions fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
