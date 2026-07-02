'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePageTitle } from '@/lib/title-context';
import { useUI } from '@/lib/ui-context';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'borrowed', label: 'Borrowed' },
  { key: 'returned', label: 'Returned' },
];

export default function TransactionsPage() {
  usePageTitle('Transactions');
  const { showAlert, showLoading, hideLoading, confirmAction } = useUI();

  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [filter, setFilter] = useState('all');

  const [selectedBook, setSelectedBook] = useState('');
  const [selectedUser, setSelectedUser] = useState('');

  const fetchTransactions = useCallback(async (f) => {
    showLoading();
    try {
      const res = await fetch('/api/transactions?filter=' + encodeURIComponent(f));
      const data = await res.json();
      if (data.success) {
        setTransactions(data.transactions);
      } else {
        showAlert(data.message || 'Failed to load transactions.', 'error');
      }
    } catch {
      showAlert('Network error while loading transactions.', 'error');
    } finally {
      hideLoading();
      setLoaded(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchBooksAndUsers = useCallback(async () => {
    try {
      const [booksRes, usersRes] = await Promise.all([
        fetch('/api/books'),
        fetch('/api/users'),
      ]);
      const booksData = await booksRes.json();
      const usersData = await usersRes.json();

      if (booksData.success) {
        const sorted = [...booksData.books].sort((a, b) => a.title.localeCompare(b.title));
        setBooks(sorted);
      }
      if (usersData.success) {
        setUsers(usersData.users);
      }
    } catch {
      showAlert('Network error while loading form options.', 'error');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchBooksAndUsers();
    fetchTransactions('all');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleFilterClick(key) {
    setFilter(key);
    fetchTransactions(key);
  }

  async function handleBorrowSubmit(e) {
    e.preventDefault();

    if (!selectedBook || !selectedUser) {
      showAlert('Please select both a book and a borrower.', 'error');
      return;
    }

    showLoading();
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ book_id: selectedBook, user_id: selectedUser }),
      });
      const data = await res.json();
      showAlert(data.message, data.success ? 'success' : 'error');
      if (data.success) {
        setSelectedBook('');
        setSelectedUser('');
        fetchTransactions(filter);
        // Refresh the "available copies" dropdown counts, mirroring the
        // original page's full reload after a successful borrow.
        fetchBooksAndUsers();
      }
    } catch {
      showAlert('Network error while borrowing the book.', 'error');
    } finally {
      hideLoading();
    }
  }

  function handleReturnClick(transactionId) {
    confirmAction(
      'Return Book',
      'Confirm that this book has been returned?',
      () => returnBook(transactionId)
    );
  }

  async function returnBook(transactionId) {
    showLoading();
    try {
      const res = await fetch(`/api/transactions/${transactionId}`, { method: 'PATCH' });
      const data = await res.json();
      showAlert(data.message, data.success ? 'success' : 'error');
      if (data.success) {
        fetchTransactions(filter);
        fetchBooksAndUsers();
      }
    } catch {
      showAlert('Network error while returning the book.', 'error');
    } finally {
      hideLoading();
    }
  }

  return (
    <>
      {/* Borrow a Book */}
      <section className="card">
        <div className="card-header">
          <h2>Borrow a Book</h2>
        </div>

        <form className="inline-form" onSubmit={handleBorrowSubmit}>
          <div className="form-group">
            <label htmlFor="borrow_book_id">Book</label>
            <select
              id="borrow_book_id"
              value={selectedBook}
              onChange={(e) => setSelectedBook(e.target.value)}
            >
              <option value="">Select a book</option>
              {books.map((b) => (
                <option key={b.book_id} value={b.book_id} disabled={b.available_copies <= 0}>
                  {b.title} ({b.available_copies} available)
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="borrow_user_id">Borrower</label>
            <select
              id="borrow_user_id"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
            >
              <option value="">Select a user</option>
              {users.map((u) => (
                <option key={u.user_id} value={u.user_id}>{u.full_name}</option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn btn-primary">Borrow Book</button>
        </form>
      </section>

      {/* Transaction History */}
      <section className="card">
        <div className="card-header">
          <h2>Transaction History</h2>
          <div className="filter-tabs">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                className={'filter-tab' + (filter === f.key ? ' active' : '')}
                onClick={() => handleFilterClick(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Book</th>
                <th>Borrower</th>
                <th>Borrow Date</th>
                <th>Due Date</th>
                <th>Return Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {!loaded ? (
                <tr><td colSpan={8} className="empty-row">Loading...</td></tr>
              ) : transactions.length === 0 ? (
                <tr><td colSpan={8} className="empty-row">No transactions found.</td></tr>
              ) : (
                transactions.map((t) => (
                  <tr key={t.transaction_id}>
                    <td>#{t.transaction_id}</td>
                    <td>{t.title}</td>
                    <td>{t.full_name}</td>
                    <td>{t.borrow_date}</td>
                    <td>{t.due_date || '-'}</td>
                    <td>{t.return_date || '-'}</td>
                    <td>
                      <span className={'badge ' + (t.status === 'returned' ? 'badge-green' : 'badge-orange')}>
                        {t.status === 'returned' ? 'Returned' : 'Borrowed'}
                      </span>
                    </td>
                    <td>
                      {t.status === 'borrowed' ? (
                        <button className="btn btn-sm btn-secondary" onClick={() => handleReturnClick(t.transaction_id)}>
                          Return
                        </button>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
