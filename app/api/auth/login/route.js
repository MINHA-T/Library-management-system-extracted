import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { createSessionToken, sessionCookieOptions, SESSION_COOKIE } from '@/lib/auth';

export async function POST(request) {
  try {
    const body = await request.json();
    const username = (body.username || '').trim();
    const password = body.password || '';

    const rows = await query(
      'SELECT user_id, full_name, username, password, role FROM users WHERE username = ? LIMIT 1',
      [username]
    );

    const user = rows[0];

    // Plain text password check
    if (!user || password !== user.password) {
      return NextResponse.json(
        { success: false, message: 'Invalid username or password.' },
        { status: 401 }
      );
    }

    const token = await createSessionToken(user);

    const response = NextResponse.json({
      success: true,
      user: {
        user_id: user.user_id,
        full_name: user.full_name,
        username: user.username,
        role: user.role,
      },
    });

    response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
    return response;

  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        success: false,
        message: err.message,
      },
      { status: 500 }
    );
  }
}
