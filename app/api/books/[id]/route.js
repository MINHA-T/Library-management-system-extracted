import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { query } from '@/lib/db';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth';

async function requireSession() {
  return verifySessionToken(cookies().get(SESSION_COOKIE)?.value);
}

// ---- PUT: edit an existing book ----
export async function PUT(request, { params }) {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const bookId = parseInt(params.id, 10) || 0;
    const body = await request.json();
    const title = (body.title || '').trim();
    const author = (body.author || '').trim();
    const isbn = (body.isbn || '').trim();
    const category = (body.category || '').trim() || 'General';
    const total = Math.max(0, parseInt(body.total_copies, 10) || 0);
    const available = Math.max(0, parseInt(body.available_copies, 10) || 0);

    if (bookId <= 0 || !title || !author || !isbn) {
      return NextResponse.json({ success: false, message: 'Missing required fields.' });
    }
    if (available > total) {
      return NextResponse.json({ success: false, message: 'Available copies cannot exceed total copies.' });
    }

    const dup = await query('SELECT COUNT(*) AS cnt FROM books WHERE isbn = ? AND book_id != ?', [isbn, bookId]);
    if (dup[0].cnt > 0) {
      return NextResponse.json({ success: false, message: 'Another book already uses this ISBN.' });
    }

    await query(
      `UPDATE books
       SET title = ?, author = ?, isbn = ?, category = ?, total_copies = ?, available_copies = ?
       WHERE book_id = ?`,
      [title, author, isbn, category, total, available, bookId]
    );

    return NextResponse.json({ success: true, message: 'Book updated successfully.' });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Database error occurred.' }, { status: 500 });
  }
}

// ---- DELETE: remove a book ----
export async function DELETE(request, { params }) {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const bookId = parseInt(params.id, 10) || 0;
    if (bookId <= 0) {
      return NextResponse.json({ success: false, message: 'Invalid book ID.' });
    }

    const active = await query(
      "SELECT COUNT(*) AS cnt FROM transactions WHERE book_id = ? AND status = 'borrowed'",
      [bookId]
    );
    if (active[0].cnt > 0) {
      return NextResponse.json({ success: false, message: 'Cannot delete: this book has active borrow records.' });
    }

    await query('DELETE FROM books WHERE book_id = ?', [bookId]);

    return NextResponse.json({ success: true, message: 'Book deleted successfully.' });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Database error occurred.' }, { status: 500 });
  }
}
