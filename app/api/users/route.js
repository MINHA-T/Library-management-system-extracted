import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { query } from '@/lib/db';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth';

export async function GET() {
  const session = await verifySessionToken(cookies().get(SESSION_COOKIE)?.value);
  if (!session) {
    return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const users = await query('SELECT user_id, full_name FROM users ORDER BY full_name ASC');
    return NextResponse.json({ success: true, users });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Database error occurred.' }, { status: 500 });
  }
}
