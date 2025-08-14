import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { WithdrawalDBResult, WithdrawalStatsDBResult, WithdrawalStatsAccumulator } from '@/types';



export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status');
    const user_id = searchParams.get('user_id');

    let whereClause = 'WHERE 1=1';
    const queryParams: (string | number)[] = [];
    let paramIndex = 1;

    if (status) {
      whereClause += ` AND w.status = $${paramIndex}`;
      queryParams.push(status);
      paramIndex++;
    }

    if (user_id) {
      whereClause += ` AND u.telegram_id = $${paramIndex}`;
      queryParams.push(user_id);
      paramIndex++;
    }

    // Получаем выводы с информацией о пользователях
    const withdrawalsResult = await db.query(
      `SELECT
         w.*,
         u.telegram_id,
         u.phone,
         COALESCE(u.phone, 'User ' || u.telegram_id) as user_display
       FROM withdrawals w
       JOIN users u ON w.user_id = u.id
       ${whereClause}
       ORDER BY w.created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...queryParams, limit, offset]
    );

    // Получаем общее количество
    const countResult = await db.query(
      `SELECT COUNT(*) as total
       FROM withdrawals w
       JOIN users u ON w.user_id = u.id
       ${whereClause}`,
      queryParams
    );

    const total = parseInt((countResult.rows[0] as { total: string }).total);

    // Форматируем выводы
    const withdrawals = (withdrawalsResult.rows as unknown as WithdrawalDBResult[]).map((withdrawal: WithdrawalDBResult) => ({
      id: withdrawal.id,
      user_id: withdrawal.user_id,
      telegram_id: withdrawal.telegram_id,
      user_display: withdrawal.user_display,
      amount: parseFloat(withdrawal.amount),
      payer_amount: withdrawal.payer_amount ? parseFloat(withdrawal.payer_amount) : null,
      address: withdrawal.address,
      fee: parseFloat(withdrawal.fee),
      currency: withdrawal.currency,
      status: withdrawal.status,
      network_code: withdrawal.network_code,
      provider: withdrawal.provider,
      provider_order_id: withdrawal.provider_order_id,
      provider_uuid: withdrawal.provider_uuid,
      provider_tx_id: withdrawal.provider_tx_id,
      txid: withdrawal.txid,
      is_subtract: withdrawal.is_subtract,
      is_final: withdrawal.is_final,
      requested_at: withdrawal.requested_at,
      processed_at: withdrawal.processed_at,
      created_at: withdrawal.created_at,
      updated_at: withdrawal.updated_at
    }));

    // Получаем статистику
    const statsResult = await db.query(
      `SELECT
         w.status,
         COUNT(*) as count,
         SUM(w.amount) as total_amount,
         SUM(w.fee) as total_fees
       FROM withdrawals w
       JOIN users u ON w.user_id = u.id
       GROUP BY w.status
       ORDER BY w.status`
    );

    const stats = (statsResult.rows as unknown as WithdrawalStatsDBResult[]).reduce((acc: WithdrawalStatsAccumulator, row: WithdrawalStatsDBResult) => {
      acc[row.status] = {
        count: parseInt(row.count),
        total_amount: parseFloat(row.total_amount || '0'),
        total_fees: parseFloat(row.total_fees || '0')
      };
      return acc;
    }, {});

    // Получаем количество pending выводов для уведомлений
    const pendingResult = await db.query(
      'SELECT COUNT(*) as pending_count FROM withdrawals WHERE status = $1',
      ['pending']
    );

    const pendingCount = parseInt((pendingResult.rows[0] as { pending_count: string }).pending_count);

    return NextResponse.json({
      success: true,
      data: {
        withdrawals,
        pagination: {
          total,
          limit,
          offset,
          has_more: offset + limit < total
        },
        stats,
        pending_count: pendingCount
      }
    });

  } catch (error: unknown) {
    console.error('Admin withdrawals fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
