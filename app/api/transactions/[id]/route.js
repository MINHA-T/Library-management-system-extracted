import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getConnection } from '@/lib/db';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth';

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

// ---- PATCH: mark a transaction as returned (transactional) ----
export async function PATCH(request, { params }) {
  const session = await verifySessionToken(cookies().get(SESSION_COOKIE)?.value);
  if (!session) {
    return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 });
  }

  const transactionId = parseInt(params.id, 10) || 0;
  if (transactionId <= 0) {
    return NextResponse.json({ success: false, message: 'Invalid transaction.' });
  }

  const conn = await getConnection();
  try {
    await conn.beginTransaction();

    const [txnRows] = await conn.execute(
      'SELECT * FROM transactions WHERE transaction_id = ? FOR UPDATE',
      [transactionId]
    );
    const txn = txnRows[0];

    if (!txn || txn.status === 'returned') {
      await conn.rollback();
      return NextResponse.json({ success: false, message: 'This book has already been returned.' });
    }

    await conn.execute(
      "UPDATE transactions SET return_date = ?, status = 'returned' WHERE transaction_id = ?",
      [todayISO(), transactionId]
    );
    await conn.execute(
      'UPDATE books SET available_copies = available_copies + 1 WHERE book_id = ?',
      [txn.book_id]
    );

    await conn.commit();
    return NextResponse.json({ success: true, message: 'Book returned successfully.' });
  } catch (err) {
    try { await conn.rollback(); } catch {}
    return NextResponse.json({ success: false, message: 'Database error occurred.' }, { status: 500 });
  } finally {
    conn.release();
  }
}
