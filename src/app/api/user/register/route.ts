import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';

interface RegisterUserRequest {
  telegram_id: string;
  phone?: string;
  language?: 'ru' | 'en';
  referred_by_code?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { telegram_id, phone, language = 'ru', referred_by_code }: RegisterUserRequest = await request.json();

    if (!telegram_id) {
      return NextResponse.json(
        { success: false, error: 'Telegram ID is required' },
        { status: 400 }
      );
    }

    // Проверяем, существует ли уже пользователь
    const existingUser = await db.query(
      'SELECT id, ref_code FROM users WHERE telegram_id = $1',
      [telegram_id]
    );

    if (existingUser.rows.length > 0) {
      return NextResponse.json({
        success: true,
        data: {
          user_id: existingUser.rows[0].id,
          ref_code: existingUser.rows[0].ref_code,
          message: 'User already exists'
        }
      });
    }

    // Генерируем уникальный реферальный код
    const generateRefCode = () => {
      return crypto.randomBytes(4).toString('hex').toUpperCase();
    };

    let refCode = generateRefCode();
    let isUniqueCode = false;
    let attempts = 0;

    // Проверяем уникальность реферального кода
    while (!isUniqueCode && attempts < 10) {
      const existingCodeResult = await db.query(
        'SELECT id FROM users WHERE ref_code = $1',
        [refCode]
      );

      if (existingCodeResult.rows.length === 0) {
        isUniqueCode = true;
      } else {
        refCode = generateRefCode();
        attempts++;
      }
    }

    if (!isUniqueCode) {
      return NextResponse.json(
        { success: false, error: 'Failed to generate unique referral code' },
        { status: 500 }
      );
    }

    // Проверяем реферера, если указан реферальный код
    let referredById = null;
    if (referred_by_code) {
      const referrerResult = await db.query(
        'SELECT id FROM users WHERE ref_code = $1',
        [referred_by_code]
      );

      if (referrerResult.rows.length > 0) {
        referredById = referrerResult.rows[0].id;
      }
    }

    // Создаем пользователя в транзакции
    const result = await db.transaction(async (client) => {
      // Создаем пользователя
      const userResult = await client.query(
        `INSERT INTO users
         (telegram_id, phone, language, ref_code, referred_by_id, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
         RETURNING id, ref_code`,
        [telegram_id, phone, language, refCode, referredById]
      );

      const userId = userResult.rows[0].id;

      // Создаем начальный баланс пользователя
      await client.query(
        `INSERT INTO users_balance
         (user_id, currency, available, bonus, locked, updated_at)
         VALUES ($1, 'USDT', 0, 0, 0, NOW())`,
        [userId]
      );

      // Логируем создание пользователя
      await client.query(
        `INSERT INTO audit_log
         (actor_user_id, action, target_type, target_id, metadata, created_at)
         VALUES ($1, 'user_registered', 'user', $2, $3, NOW())`,
        [userId, userId.toString(), JSON.stringify({
          telegram_id,
          language,
          referred_by_code: referred_by_code || null,
          referred_by_id: referredById
        })]
      );

      return userResult.rows[0];
    });

    return NextResponse.json({
      success: true,
      data: {
        user_id: result.id,
        ref_code: result.ref_code,
        message: 'User created successfully'
      }
    });

  } catch (error: unknown) {
    console.error('User registration error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET метод для проверки существования пользователя
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const telegram_id = searchParams.get('telegram_id');

    if (!telegram_id) {
      return NextResponse.json(
        { success: false, error: 'Telegram ID is required' },
        { status: 400 }
      );
    }

    const userResult = await db.query(
      'SELECT id, ref_code, language, created_at FROM users WHERE telegram_id = $1',
      [telegram_id]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }

    const user = userResult.rows[0];

    return NextResponse.json({
      success: true,
      data: {
        user_id: user.id,
        ref_code: user.ref_code,
        language: user.language,
        created_at: user.created_at
      }
    });

  } catch (error: unknown) {
    console.error('User check error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
