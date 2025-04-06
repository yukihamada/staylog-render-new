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
    const result = await db.query(
      'SELECT id, email, full_name, avatar_url, billing_address, payment_method FROM users WHERE id = $1',
      [userId]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  // 認証ミドルウェアを適用
  const authResponse = await authMiddleware(req);
  
  if (authResponse.status === 401) {
    return authResponse;
  }
  
  const userId = req.headers.get('x-user-id');
  
  try {
    const { fullName, avatarUrl, billingAddress, paymentMethod } = await req.json();
    
    // 更新するフィールドを構築
    const updates = [];
    const values = [];
    let paramIndex = 1;
    
    if (fullName !== undefined) {
      updates.push(`full_name = $${paramIndex}`);
      values.push(fullName);
      paramIndex++;
    }
    
    if (avatarUrl !== undefined) {
      updates.push(`avatar_url = $${paramIndex}`);
      values.push(avatarUrl);
      paramIndex++;
    }
    
    if (billingAddress !== undefined) {
      updates.push(`billing_address = $${paramIndex}`);
      values.push(JSON.stringify(billingAddress));
      paramIndex++;
    }
    
    if (paymentMethod !== undefined) {
      updates.push(`payment_method = $${paramIndex}`);
      values.push(JSON.stringify(paymentMethod));
      paramIndex++;
    }
    
    // 更新するフィールドがない場合
    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }
    
    // ユーザーを更新
    const query = `
      UPDATE users
      SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramIndex}
      RETURNING id, email, full_name, avatar_url, billing_address, payment_method
    `;
    
    values.push(userId);
    
    const result = await db.query(query, values);
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}