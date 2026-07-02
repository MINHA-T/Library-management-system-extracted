'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePageTitle } from '@/lib/title-context';
import { useUI } from '@/lib/ui-context';

export default function DashboardPage() {
  usePageTitle('Dashboard');
  const { showAlert } = useUI();

  const [stats, setStats] = useState({
    totalBooks: 0,
    availableBooks: 0,
    borrowedBooks: 0,
    totalUsers: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch('/api/dashboard');
        const data = await res.json();
        if (cancelled) return;
        if (data.success) {
          setStats(data.stats);
          setRecentTransactions(data.recentTransactions);
        } else {
          showAlert(data.message || 'Failed to load dashboard.', 'error');
        }
      } catch {
        if (!cancelled) showAlert('Network error while loading dashboard.', 'error');
      } finally {
        if (!cancelled) setLoaded(true);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {/* Statistic Cards */}
      <section className="stats-grid">
        <div className="stat-card stat-blue">
          <div className="stat-icon">📚</div>
          <div className="stat-info">
            <span className="stat-value">{stats.totalBooks}</span>
            <span className="stat-label">Total Books</span>
          </div>
        </div>

        <div className="stat-card stat-green">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <span className="stat-value">{stats.availableBooks}</span>
            <span className="stat-label">Available Books</span>
          </div>
        </div>

        <div className="stat-card stat-peach">
          <div className="stat-icon">📖</div>
          <div className="stat-info">
            <span className="stat-value">{stats.borrowedBooks}</span>
            <span className="stat-label">Borrowed Books</span>
          </div>
        </div>

        <div className="stat-card stat-lavender">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <span className="stat-value">{stats.totalUsers}</span>
            <span className="stat-label">Total Users</span>
          </div>
        </div>
      </section>

      {/* Recent Transactions */}
      <section className="card">
        <div className="card-header">
          <h2>Recent Borrowing Transactions</h2>
          <Link href="/transactions" className="btn btn-outline btn-sm">View All</Link>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Book Title</th>
                <th>Borrower</th>
                <th>Borrow Date</th>
                <th>Due Date</th>
                <th>Return Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {!loaded ? (
                <tr><td colSpan={7} className="empty-row">Loading...</td></tr>
              ) : recentTransactions.length === 0 ? (
                <tr><td colSpan={7} className="empty-row">No transactions yet.</td></tr>
              ) : (
                recentTransactions.map((t) => (
                  <tr key={t.transaction_id}>
                    <td>#{t.transaction_id}</td>
                    <td>{t.title}</td>
                    <td>{t.full_name}</td>
                    <td>{t.borrow_date}</td>
                    <td>{t.due_date || '-'}</td>
                    <td>{t.return_date || '-'}</td>
                    <td>
                      <span className={'badge ' + (t.status === 'returned' ? 'badge-green' : 'badge-orange')}>
                        {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                      </span>
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
