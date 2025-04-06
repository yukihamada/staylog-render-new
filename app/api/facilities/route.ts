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
      'SELECT * FROM facilities WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching facilities:', error);
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
    const { name, address, type, capacity } = await req.json();
    
    // 必須フィールドの検証
    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }
    
    // 施設を作成
    const result = await db.query(`
      INSERT INTO facilities (user_id, name, address, type, capacity)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [userId, name, address || null, type || null, capacity || null]);
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating facility:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}