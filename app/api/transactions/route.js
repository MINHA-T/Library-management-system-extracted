import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getConnection, query } from '@/lib/db';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth';

const LOAN_PERIOD_DAYS = 14;

async function requireSession() {
  return verifySessionToken(cookies().get(SESSION_COOKIE)?.value);
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function addDaysISO(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

// ---- GET: transaction list, optionally filtered by status ----
export async function GET(request) {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all';

    let sql = `SELECT t.transaction_id, t.book_id, t.user_id, b.title, u.full_name,
                      t.borrow_date, t.due_date, t.return_date, t.status
               FROM transactions t
               JOIN books b ON b.book_id = t.book_id
               JOIN users u ON u.user_id = t.user_id`;
    if (filter === 'borrowed') {
      sql += " WHERE t.status = 'borrowed'";
    } else if (filter === 'returned') {
      sql += " WHERE t.status = 'returned'";
    }
    sql += ' ORDER BY t.transaction_id DESC';

    const transactions = await query(sql);
    return NextResponse.json({ success: true, transactions });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Database error occurred.' }, { status: 500 });
  }
}

// ---- POST: borrow a book (transactional, mirrors PDO beginTransaction/commit) ----
export async function POST(request) {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 });
  }

  const body = await request.json();
  const bookId = parseInt(body.book_id, 10) || 0;
  const userId = parseInt(body.user_id, 10) || 0;

  if (bookId <= 0 || userId <= 0) {
    return NextResponse.json({ success: false, message: 'Please select both a book and a borrower.' });
  }

  const conn = await getConnection();
  try {
    await conn.beginTransaction();

    const [bookRows] = await conn.execute(
      'SELECT available_copies FROM books WHERE book_id = ? FOR UPDATE',
      [bookId]
    );
    const book = bookRows[0];

    if (!book) {
      await conn.rollback();
      return NextResponse.json({ success: false, message: 'Book not found.' });
    }
    if (Number(book.available_copies) <= 0) {
      await conn.rollback();
      return NextResponse.json({ success: false, message: 'No copies available for this book right now.' });
    }

    const borrowDate = todayISO();
    const dueDate = addDaysISO(LOAN_PERIOD_DAYS);

    await conn.execute(
      `INSERT INTO transactions (book_id, user_id, borrow_date, due_date, status)
       VALUES (?, ?, ?, ?, 'borrowed')`,
      [bookId, userId, borrowDate, dueDate]
    );
    await conn.execute(
      'UPDATE books SET available_copies = available_copies - 1 WHERE book_id = ?',
      [bookId]
    );

    await conn.commit();
    return NextResponse.json({ success: true, message: 'Book borrowed successfully.' });
  } catch (err) {
    try { await conn.rollback(); } catch {}
    return NextResponse.json({ success: false, message: 'Database error occurred.' }, { status: 500 });
  } finally {
    conn.release();
  }
}
