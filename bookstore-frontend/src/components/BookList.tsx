import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import ToastNotification from './ToastNotification';
import { API_URL } from '../api';

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

interface NavState {
  returnPage?: number;
  returnPageSize?: number;
  returnCategory?: string;
}

export default function BookList() {
  const location = useLocation();
  const navState = (location.state as NavState) ?? {};

  const [books, setBooks] = useState<Book[]>([]);
  const [page, setPage] = useState(navState.returnPage ?? 1);
  const [pageSize, setPageSize] = useState(navState.returnPageSize ?? 5);
  const [totalCount, setTotalCount] = useState(0);
  const [sortBy] = useState('title');
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(navState.returnCategory ?? '');
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  const { addToCart, items, totalItems, totalPrice } = useCart();

  const totalPages = Math.ceil(totalCount / pageSize);

  // Fetch categories once on mount
  useEffect(() => {
    fetch(`${API_URL}/api/books/categories`)
      .then(res => res.json())
      .then(data => setCategories(data));
  }, []);

  // Fetch books whenever page/pageSize/sortBy/category changes
  useEffect(() => {
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
      sortBy,
    });
    if (selectedCategory) params.append('category', selectedCategory);

    fetch(`${API_URL}/api/books?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        setBooks(data.books);
        setTotalCount(data.totalCount);
      });
  }, [page, pageSize, sortBy, selectedCategory]);

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value));
    setPage(1);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
    setPage(1);
  };

  const handleAddToCart = (book: Book) => {
    addToCart({
      bookID: book.bookID,
      title: book.title,
      author: book.author,
      price: book.price,
    });
    setToastMessage(`"${book.title}" added to cart.`);
    setShowToast(true);
  };

  const handleCloseToast = useCallback(() => setShowToast(false), []);

  // Current nav state to pass when going to cart
  const cartNavState = { returnPage: page, returnPageSize: pageSize, returnCategory: selectedCategory };

  return (
    <div className="container-fluid mt-4">
      <div className="row">
        {/* Main content column */}
        <div className="col-lg-9 col-md-8 col-12">
          <h1 className="mb-4">Online Bookstore</h1>

          {/* Controls row */}
          <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
            <div className="d-flex align-items-center gap-3 flex-wrap">
              <div>
                <label className="me-2">Results per page:</label>
                <select className="form-select d-inline w-auto" value={pageSize} onChange={handlePageSizeChange}>
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                </select>
              </div>
              <div>
                <label className="me-2">Category:</label>
                <select className="form-select d-inline w-auto" value={selectedCategory} onChange={handleCategoryChange}>
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
            <span className="text-muted">Total books: {totalCount}</span>
          </div>

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
                  <th>Cart</th>
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
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => handleAddToCart(book)}
                      >
                        Add to Cart
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <nav>
            <ul className="pagination justify-content-center flex-wrap">
              <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => setPage(p => p - 1)}>Previous</button>
              </li>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <li key={p} className={`page-item ${p === page ? 'active' : ''}`}>
                  <button className="page-link" onClick={() => setPage(p)}>{p}</button>
                </li>
              ))}
              <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => setPage(p => p + 1)}>Next</button>
              </li>
            </ul>
          </nav>
        </div>

        {/* Cart Summary Sidebar */}
        <div className="col-lg-3 col-md-4 col-12 mt-3 mt-md-0">
          <div className="card shadow-sm">
            <div className="card-header bg-dark text-white">
              <strong>Cart Summary</strong>
            </div>
            <div className="card-body">
              {totalItems === 0 ? (
                <p className="text-muted mb-0">Your cart is empty.</p>
              ) : (
                <>
                  <ul className="list-unstyled mb-3">
                    {items.map(item => (
                      <li key={item.bookID} className="d-flex justify-content-between mb-1">
                        <span className="text-truncate me-2" style={{ maxWidth: '140px' }} title={item.title}>
                          {item.title}
                        </span>
                        <span className="text-nowrap text-muted">x{item.quantity} &mdash; ${(item.price * item.quantity).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                  <hr />
                  <div className="d-flex justify-content-between fw-bold">
                    <span>Total:</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>
            <div className="card-footer">
              <Link to="/cart" state={cartNavState} className="btn btn-dark w-100">
                View Cart ({totalItems})
              </Link>
            </div>
          </div>
        </div>
      </div>

      <ToastNotification message={toastMessage} show={showToast} onClose={handleCloseToast} />
    </div>
  );
}
