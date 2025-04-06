import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { authMiddleware } from '@/lib/auth-middleware';

export async function GET(req: NextRequest) {
  // 認証ミドルウェアを適用
  const authResponse = await authMiddleware(req);
  
  if (authResponse.status === 401) {
    return authResponse;
  }
  
  const userId = req.headers.get('x-user-id');
  
  try {
    // ユーザーのサブスクリプションを取得
    const result = await db.query(`
      SELECT s.*, 
             json_build_object(
               'id', p.id,
               'product_id', p.product_id,
               'active', p.active,
               'description', p.description,
               'unit_amount', p.unit_amount,
               'currency', p.currency,
               'type', p.type,
               'interval', p.interval,
               'interval_count', p.interval_count,
               'trial_period_days', p.trial_period_days,
               'metadata', p.metadata,
               'products', (
                 SELECT json_build_object(
                   'id', pr.id,
                   'active', pr.active,
                   'name', pr.name,
                   'description', pr.description,
                   'image', pr.image,
                   'metadata', pr.metadata
                 )
                 FROM products pr
                 WHERE pr.id = p.product_id
               )
             ) AS prices
      FROM subscriptions s
      LEFT JOIN prices p ON s.price_id = p.id
      WHERE s.user_id = $1
      ORDER BY s.created DESC
      LIMIT 1
    `, [userId]);
    
    if (result.rows.length === 0) {
      return NextResponse.json(null);
    }
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  // 認証ミドルウェアを適用
  const authResponse = await authMiddleware(req);
  
  if (authResponse.status === 401) {
    return authResponse;
  }
  
  const userId = req.headers.get('x-user-id');
  
  try {
    const { priceId } = await req.json();
    
    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID is required' },
        { status: 400 }
      );
    }
    
    // サブスクリプションIDを生成
    const subscriptionId = `sub_${Date.now()}`;
    
    // サブスクリプションを作成
    await db.query(`
      INSERT INTO subscriptions (
        id, user_id, status, price_id, quantity, cancel_at_period_end,
        current_period_start, current_period_end
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      subscriptionId,
      userId,
      'active',
      priceId,
      1,
      false,
      new Date(),
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30日後
    ]);
    
    return NextResponse.json({
      id: subscriptionId,
      status: 'active',
      user_id: userId,
      price_id: priceId
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}