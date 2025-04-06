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
  const facilityId = req.nextUrl.searchParams.get('facility_id');
  
  try {
    let query = `
      SELECT g.*
      FROM guests g
      JOIN facilities f ON g.facility_id = f.id
      WHERE f.user_id = $1
    `;
    
    const params = [userId];
    
    if (facilityId) {
      query += ' AND g.facility_id = $2';
      params.push(facilityId);
    }
    
    query += ' ORDER BY g.created_at DESC';
    
    const result = await db.query(query, params);
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching guests:', error);
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
    const {
      facilityId,
      name,
      address,
      phone,
      nationality,
      passportNumber,
      dateOfBirth,
      idPhotoUrl,
      checkInDate,
      checkOutDate
    } = await req.json();
    
    // 必須フィールドの検証
    if (!facilityId || !name || !address) {
      return NextResponse.json(
        { error: 'Facility ID, name, and address are required' },
        { status: 400 }
      );
    }
    
    // 施設がユーザーに属しているか確認
    const facilityResult = await db.query(
      'SELECT id FROM facilities WHERE id = $1 AND user_id = $2',
      [facilityId, userId]
    );
    
    if (facilityResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Facility not found or not owned by user' },
        { status: 404 }
      );
    }
    
    // 宿泊者を作成
    const result = await db.query(`
      INSERT INTO guests (
        facility_id, name, address, phone, nationality, passport_number,
        date_of_birth, id_photo_url, check_in_date, check_out_date
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [
      facilityId,
      name,
      address,
      phone || null,
      nationality || null,
      passportNumber || null,
      dateOfBirth || null,
      idPhotoUrl || null,
      checkInDate || null,
      checkOutDate || null
    ]);
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating guest:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}