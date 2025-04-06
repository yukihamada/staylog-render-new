import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getUserById } from './auth';

export async function authMiddleware(req: NextRequest) {
  // Authorization ヘッダーからトークンを取得
  const authHeader = req.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Unauthorized: Missing or invalid token' },
      { status: 401 }
    );
  }
  
  const token = authHeader.split(' ')[1];
  
  // トークンを検証
  const decoded = verifyToken(token);
  
  if (!decoded || !decoded.id) {
    return NextResponse.json(
      { error: 'Unauthorized: Invalid token' },
      { status: 401 }
    );
  }
  
  // ユーザーをデータベースから取得
  const user = await getUserById(decoded.id);
  
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized: User not found' },
      { status: 401 }
    );
  }
  
  // リクエストにユーザー情報を追加
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-user-id', user.id);
  requestHeaders.set('x-user-email', user.email);
  
  // 修正されたリクエストを返す
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}