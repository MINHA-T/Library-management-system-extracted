'use client';

import { useEffect, useState } from 'react';

const emptyForm = {
  book_id: '',
  title: '',
  author: '',
  isbn: '',
  category: '',
  total_copies: '',
  available_copies: '',
};

export default function BookModal({ open, mode, initialData, onClose, onSubmit }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && initialData) {
        setForm({
          book_id: initialData.book_id,
          title: initialData.title,
          author: initialData.author,
          isbn: initialData.isbn,
          category: initialData.category,
          total_copies: initialData.total_copies,
          available_copies: initialData.available_copies,
        });
      } else {
        setForm(emptyForm);
      }
      setErrors({});
    }
  }, [open, mode, initialData]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();

    const nextErrors = {};
    if (form.title.trim() === '') nextErrors.title = 'Title is required.';
    if (form.author.trim() === '') nextErrors.author = 'Author is required.';
    if (form.isbn.trim() === '') nextErrors.isbn = 'ISBN is required.';
    if (form.total_copies === '' || Number(form.total_copies) < 0) {
      nextErrors.total_copies = 'Enter a valid number of copies.';
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSubmit(form);
  }

  return (
    <div className={'modal-overlay' + (open ? ' active' : '')} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <h3>{mode === 'edit' ? 'Edit Book' : 'Add New Book'}</h3>
        <form onSubmit={handleSubmit} noValidate>
          <input type="hidden" name="book_id" value={form.book_id} />

          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              className={errors.title ? 'input-error' : ''}
              value={form.title}
              onChange={handleChange}
            />
            <span className="field-error">{errors.title}</span>
          </div>

          <div className="form-group">
            <label htmlFor="author">Author</label>
            <input
              type="text"
              id="author"
              name="author"
              className={errors.author ? 'input-error' : ''}
              value={form.author}
              onChange={handleChange}
            />
            <span className="field-error">{errors.author}</span>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="isbn">ISBN</label>
              <input
                type="text"
                id="isbn"
                name="isbn"
                className={errors.isbn ? 'input-error' : ''}
                value={form.isbn}
                onChange={handleChange}
              />
              <span className="field-error">{errors.isbn}</span>
            </div>

            <div className="form-group">
              <label htmlFor="category">Category</label>
              <input
                type="text"
                id="category"
                name="category"
                placeholder="e.g. Fiction"
                value={form.category}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="total_copies">Total Copies</label>
              <input
                type="number"
                id="total_copies"
                name="total_copies"
                min="0"
                className={errors.total_copies ? 'input-error' : ''}
                value={form.total_copies}
                onChange={handleChange}
              />
              <span className="field-error">{errors.total_copies}</span>
            </div>

            <div className="form-group" style={{ display: mode === 'edit' ? 'flex' : 'none' }}>
              <label htmlFor="available_copies">Available Copies</label>
              <input
                type="number"
                id="available_copies"
                name="available_copies"
                min="0"
                value={form.available_copies}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Book</button>
          </div>
        </form>
      </div>
    </div>
  );
}
