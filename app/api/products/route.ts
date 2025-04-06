import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    // 製品と価格情報を取得
    const result = await db.query(`
      SELECT p.*, 
             json_agg(
               json_build_object(
                 'id', pr.id,
                 'product_id', pr.product_id,
                 'active', pr.active,
                 'description', pr.description,
                 'unit_amount', pr.unit_amount,
                 'currency', pr.currency,
                 'type', pr.type,
                 'interval', pr.interval,
                 'interval_count', pr.interval_count,
                 'trial_period_days', pr.trial_period_days,
                 'metadata', pr.metadata
               )
             ) AS prices
      FROM products p
      LEFT JOIN prices pr ON p.id = pr.product_id
      WHERE p.active = true AND pr.active = true
      GROUP BY p.id
    `);
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}