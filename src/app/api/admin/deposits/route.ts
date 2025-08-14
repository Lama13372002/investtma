import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface DepositDBResult {
  id: number;
  user_id: number;
  telegram_id: number;
  user_display: string;
  amount: string;
  merchant_amount?: string;
  payer_amount?: string;
  currency: string;
  status: string;
  payment_status: string;
  provider: string;
  provider_order_id?: string;
  provider_uuid?: string;
  network_code: string;
  address?: string;
  from_address?: string;
  provider_tx_id?: string;
  url?: string;
  confirmed_at?: string;
  expired_at?: string;
  created_at: string;
  updated_at: string;
}

interface StatsDBResult {
  status: string;
  count: string;
  total_amount: string;
}

interface StatsAccumulator {
  [key: string]: {
    count: number;
    total_amount: number;
  };
}

interface CountResult {
  total: string;
}

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
      whereClause += ` AND d.status = $${paramIndex}`;
      queryParams.push(status);
      paramIndex++;
    }

    if (user_id) {
      whereClause += ` AND u.telegram_id = $${paramIndex}`;
      queryParams.push(user_id);
      paramIndex++;
    }

    // Получаем депозиты с информацией о пользователях
    const depositsResult = await db.query(
      `SELECT
         d.*,
         u.telegram_id,
         u.phone,
         COALESCE(u.phone, 'User ' || u.telegram_id) as user_display
       FROM deposits d
       JOIN users u ON d.user_id = u.id
       ${whereClause}
       ORDER BY d.created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...queryParams, limit, offset]
    );

    // Получаем общее количество
    const countResult = await db.query(
      `SELECT COUNT(*) as total
       FROM deposits d
       JOIN users u ON d.user_id = u.id
       ${whereClause}`,
      queryParams
    );

    const total = parseInt((countResult.rows[0] as unknown as CountResult).total);

    // Форматируем депозиты
    const deposits = (depositsResult.rows as unknown as DepositDBResult[]).map((deposit: DepositDBResult) => ({
      id: deposit.id,
      user_id: deposit.user_id,
      telegram_id: deposit.telegram_id,
      user_display: deposit.user_display,
      amount: parseFloat(deposit.amount),
      merchant_amount: deposit.merchant_amount ? parseFloat(deposit.merchant_amount) : null,
      payer_amount: deposit.payer_amount ? parseFloat(deposit.payer_amount) : null,
      currency: deposit.currency,
      status: deposit.status,
      payment_status: deposit.payment_status,
      provider: deposit.provider,
      provider_order_id: deposit.provider_order_id,
      provider_uuid: deposit.provider_uuid,
      network_code: deposit.network_code,
      address: deposit.address,
      from_address: deposit.from_address,
      provider_tx_id: deposit.provider_tx_id,
      url: deposit.url,
      confirmed_at: deposit.confirmed_at,
      expired_at: deposit.expired_at,
      created_at: deposit.created_at,
      updated_at: deposit.updated_at
    }));

    // Получаем статистику
    const statsResult = await db.query(
      `SELECT
         d.status,
         COUNT(*) as count,
         SUM(CASE WHEN d.merchant_amount IS NOT NULL THEN d.merchant_amount ELSE d.amount END) as total_amount
       FROM deposits d
       JOIN users u ON d.user_id = u.id
       GROUP BY d.status
       ORDER BY d.status`
    );

    const stats = (statsResult.rows as unknown as StatsDBResult[]).reduce((acc: StatsAccumulator, row: StatsDBResult) => {
      acc[row.status] = {
        count: parseInt(row.count),
        total_amount: parseFloat(row.total_amount || '0')
      };
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      data: {
        deposits,
        pagination: {
          total,
          limit,
          offset,
          has_more: offset + limit < total
        },
        stats
      }
    });

  } catch (error: unknown) {
    console.error('Admin deposits fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
