import { useCallback, useEffect, useState } from 'react';
import { API_URL } from '../api';
import ToastNotification from './ToastNotification';

interface Book {
  bookID: number;
  title: string;
  author: string;
  publisher: string;
  isbn: string;
  classification: string;
  category: string;
  pageCount: number;
  price: number;
}

const emptyForm = {
  title: '',
  author: '',
  publisher: '',
  isbn: '',
  classification: '',
  category: '',
  pageCount: 0,
  price: 0,
};

export default function AdminBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/api/books?pageSize=1000`)
      .then(res => res.json())
      .then(data => setBooks(data.books));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'pageCount' || name === 'price' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId === null) {
      // Add mode
      const res = await fetch(`${API_URL}/api/books`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const newBook: Book = await res.json();
      setBooks(prev => [...prev, newBook]);
      setToastMessage(`"${newBook.title}" added successfully.`);
    } else {
      // Edit mode
      await fetch(`${API_URL}/api/books/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookID: editingId, ...formData }),
      });
      setBooks(prev =>
        prev.map(b => (b.bookID === editingId ? { bookID: editingId, ...formData } : b))
      );
      setToastMessage(`"${formData.title}" updated successfully.`);
    }

    setFormData(emptyForm);
    setEditingId(null);
    setShowForm(false);
    setShowToast(true);
  };

  const handleEdit = (book: Book) => {
    setEditingId(book.bookID);
    setFormData({
      title: book.title,
      author: book.author,
      publisher: book.publisher,
      isbn: book.isbn,
      classification: book.classification,
      category: book.category,
      pageCount: book.pageCount,
      price: book.price,
    });
    setShowForm(true);
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id: number, title: string) => {
    if (!window.confirm(`Delete "${title}"?`)) return;
    await fetch(`${API_URL}/api/books/${id}`, { method: 'DELETE' });
    setBooks(prev => prev.filter(b => b.bookID !== id));
    setToastMessage(`"${title}" deleted.`);
    setShowToast(true);
  };

  const handleCancel = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleCloseToast = useCallback(() => setShowToast(false), []);

  return (
    <div className="container-fluid mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1>Admin — Manage Books</h1>
        <button className="btn btn-success" onClick={() => { setShowForm(true); setEditingId(null); setFormData(emptyForm); }}>
          + Add New Book
        </button>
      </div>

      {showForm && (
        <div className="card mb-4 shadow-sm">
          <div className="card-header bg-dark text-white">
            {editingId !== null ? 'Edit Book' : 'Add New Book'}
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Title</label>
                  <input className="form-control" name="title" value={formData.title} onChange={handleChange} required />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Author</label>
                  <input className="form-control" name="author" value={formData.author} onChange={handleChange} required />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Publisher</label>
                  <input className="form-control" name="publisher" value={formData.publisher} onChange={handleChange} required />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">ISBN</label>
                  <input className="form-control" name="isbn" value={formData.isbn} onChange={handleChange} required />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Classification</label>
                  <input className="form-control" name="classification" value={formData.classification} onChange={handleChange} required />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Category</label>
                  <input className="form-control" name="category" value={formData.category} onChange={handleChange} required />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Page Count</label>
                  <input className="form-control" type="number" name="pageCount" value={formData.pageCount} onChange={handleChange} required min={1} />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Price</label>
                  <input className="form-control" type="number" name="price" value={formData.price} onChange={handleChange} required min={0} step={0.01} />
                </div>
              </div>
              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary">
                  {editingId !== null ? 'Update Book' : 'Add Book'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="table-responsive">
        <table className="table table-striped table-bordered table-hover">
          <thead className="table-dark">
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>Publisher</th>
              <th>ISBN</th>
              <th>Classification</th>
              <th>Category</th>
              <th>Pages</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {books.map(book => (
              <tr key={book.bookID}>
                <td>{book.title}</td>
                <td>{book.author}</td>
                <td>{book.publisher}</td>
                <td>{book.isbn}</td>
                <td>{book.classification}</td>
                <td>{book.category}</td>
                <td>{book.pageCount}</td>
                <td>${book.price.toFixed(2)}</td>
                <td>
                  <button className="btn btn-sm btn-outline-warning me-2" onClick={() => handleEdit(book)}>
                    Edit
                  </button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(book.bookID, book.title)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ToastNotification message={toastMessage} show={showToast} onClose={handleCloseToast} />
    </div>
  );
}
