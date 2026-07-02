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
    const [booksRows, borrowedRows, usersRows] = await Promise.all([
      query('SELECT COALESCE(SUM(total_copies),0) AS total_books, COALESCE(SUM(available_copies),0) AS available_books FROM books'),
      query("SELECT COUNT(*) AS borrowed_books FROM transactions WHERE status = 'borrowed'"),
      query('SELECT COUNT(*) AS total_users FROM users'),
    ]);
    const booksAgg = booksRows[0];
    const borrowedAgg = borrowedRows[0];
    const usersAgg = usersRows[0];

    const recentTransactions = await query(
      `SELECT t.transaction_id, b.title, u.full_name, t.borrow_date, t.due_date, t.return_date, t.status
       FROM transactions t
       JOIN books b ON b.book_id = t.book_id
       JOIN users u ON u.user_id = t.user_id
       ORDER BY t.transaction_id DESC
       LIMIT 8`
    );

    return NextResponse.json({
      success: true,
      stats: {
        totalBooks: Number(booksAgg.total_books),
        availableBooks: Number(booksAgg.available_books),
        borrowedBooks: Number(borrowedAgg.borrowed_books),
        totalUsers: Number(usersAgg.total_users),
      },
      recentTransactions,
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Database error occurred.' }, { status: 500 });
  }
}
