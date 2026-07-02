'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePageTitle } from '@/lib/title-context';
import { useUI } from '@/lib/ui-context';
import BookModal from '@/components/BookModal';

export default function BooksPage() {
  usePageTitle('Books');
  const { showAlert, showLoading, hideLoading, confirmAction } = useUI();

  const [books, setBooks] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const debounceRef = useRef(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [editingBook, setEditingBook] = useState(null);

  const fetchBooks = useCallback(async (query) => {
    showLoading();
    try {
      const res = await fetch('/api/books?q=' + encodeURIComponent(query || ''));
      const data = await res.json();
      if (data.success) {
        setBooks(data.books);
      } else {
        showAlert(data.message || 'Failed to load books.', 'error');
      }
    } catch {
      showAlert('Network error while loading books.', 'error');
    } finally {
      hideLoading();
      setLoaded(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchBooks('');
  }, [fetchBooks]);

  function handleSearchChange(e) {
    const value = e.target.value;
    setSearchTerm(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchBooks(value), 350);
  }

  function openAddModal() {
    setModalMode('add');
    setEditingBook(null);
    setModalOpen(true);
  }

  function openEditModal(book) {
    setModalMode('edit');
    setEditingBook(book);
    setModalOpen(true);
  }

  async function handleModalSubmit(form) {
    showLoading();
    try {
      const isEdit = modalMode === 'edit';
      const url = isEdit ? `/api/books/${form.book_id}` : '/api/books';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      showAlert(data.message, data.success ? 'success' : 'error');
      if (data.success) {
        setModalOpen(false);
        fetchBooks(searchTerm);
      }
    } catch {
      showAlert('Network error while saving book.', 'error');
    } finally {
      hideLoading();
    }
  }

  function handleDeleteClick(book) {
    confirmAction(
      'Delete Book',
      `Are you sure you want to delete "${book.title}"? This cannot be undone.`,
      () => deleteBook(book.book_id)
    );
  }

  async function deleteBook(bookId) {
    showLoading();
    try {
      const res = await fetch(`/api/books/${bookId}`, { method: 'DELETE' });
      const data = await res.json();
      showAlert(data.message, data.success ? 'success' : 'error');
      if (data.success) fetchBooks(searchTerm);
    } catch {
      showAlert('Network error while deleting book.', 'error');
    } finally {
      hideLoading();
    }
  }

  return (
    <section className="card">
      <div className="card-header">
        <h2>Book Catalog</h2>
        <button className="btn btn-primary" onClick={openAddModal}>+ Add New Book</button>
      </div>

      <div className="toolbar">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search by title, author, or ISBN..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <span className="search-icon">🔍</span>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>ISBN</th>
              <th>Category</th>
              <th>Total</th>
              <th>Available</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {!loaded ? (
              <tr><td colSpan={8} className="empty-row">Loading...</td></tr>
            ) : books.length === 0 ? (
              <tr><td colSpan={8} className="empty-row">No books found.</td></tr>
            ) : (
              books.map((b) => (
                <tr key={b.book_id}>
                  <td>{b.title}</td>
                  <td>{b.author}</td>
                  <td>{b.isbn}</td>
                  <td>{b.category}</td>
                  <td>{b.total_copies}</td>
                  <td>{b.available_copies}</td>
                  <td>
                    {b.available_copies > 0 ? (
                      <span className="badge badge-green">Available</span>
                    ) : (
                      <span className="badge badge-red">Unavailable</span>
                    )}
                  </td>
                  <td className="actions-cell">
                    <button className="btn-icon" title="Edit" onClick={() => openEditModal(b)}>✏️</button>
                    <button className="btn-icon" title="Delete" onClick={() => handleDeleteClick(b)}>🗑️</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <BookModal
        open={modalOpen}
        mode={modalMode}
        initialData={editingBook}
        onClose={() => setModalOpen(false)}
        onSubmit={handleModalSubmit}
      />
    </section>
  );
}
