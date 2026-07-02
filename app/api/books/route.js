import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { query } from '@/lib/db';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth';

async function requireSession() {
  return verifySessionToken(cookies().get(SESSION_COOKIE)?.value);
}

// ---- GET: search / list books (?q=term) ----
export async function GET(request) {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get('q') || '').trim();

    let books;
    if (q === '') {
      books = await query('SELECT * FROM books ORDER BY book_id DESC');
    } else {
      const term = `%${q}%`;
      books = await query(
        'SELECT * FROM books WHERE title LIKE ? OR author LIKE ? OR isbn LIKE ? ORDER BY book_id DESC',
        [term, term, term]
      );
    }

    return NextResponse.json({ success: true, books });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Database error occurred.' }, { status: 500 });
  }
}

// ---- POST: add a new book ----
export async function POST(request) {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const title = (body.title || '').trim();
    const author = (body.author || '').trim();
    const isbn = (body.isbn || '').trim();
    const category = (body.category || '').trim() || 'General';
    const copies = Math.max(0, parseInt(body.total_copies, 10) || 0);

    if (!title || !author || !isbn) {
      return NextResponse.json({ success: false, message: 'Title, author, and ISBN are required.' });
    }

    const dup = await query('SELECT COUNT(*) AS cnt FROM books WHERE isbn = ?', [isbn]);
    if (dup[0].cnt > 0) {
      return NextResponse.json({ success: false, message: 'A book with this ISBN already exists.' });
    }

    await query(
      `INSERT INTO books (title, author, isbn, category, total_copies, available_copies)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title, author, isbn, category, copies, copies]
    );

    return NextResponse.json({ success: true, message: 'Book added successfully.' });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Database error occurred.' }, { status: 500 });
  }
}
