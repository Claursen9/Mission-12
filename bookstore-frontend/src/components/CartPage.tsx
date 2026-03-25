import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

interface ReturnState {
  returnPage?: number;
  returnPageSize?: number;
  returnCategory?: string;
}

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, clearCart, totalPrice } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const returnState = (location.state as ReturnState) ?? {};

  const handleContinueShopping = () => {
    navigate('/', {
      state: {
        returnPage: returnState.returnPage ?? 1,
        returnPageSize: returnState.returnPageSize ?? 5,
        returnCategory: returnState.returnCategory ?? '',
      },
    });
  };

  return (
    <div className="container mt-4">
      <div className="row mb-3 align-items-center">
        <div className="col">
          <h1>Shopping Cart</h1>
        </div>
        <div className="col-auto">
          <button className="btn btn-outline-secondary" onClick={handleContinueShopping}>
            &larr; Continue Shopping
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="alert alert-info">
          Your cart is empty.{' '}
          <button className="btn btn-link p-0 align-baseline" onClick={handleContinueShopping}>
            Browse books
          </button>
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table table-bordered table-hover align-middle">
              <thead className="table-dark">
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Unit Price</th>
                  <th>Quantity</th>
                  <th>Subtotal</th>
                  <th>Remove</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.bookID}>
                    <td>{item.title}</td>
                    <td>{item.author}</td>
                    <td>${item.price.toFixed(2)}</td>
                    <td style={{ width: '110px' }}>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        min={1}
                        value={item.quantity}
                        onChange={e => updateQuantity(item.bookID, Number(e.target.value))}
                      />
                    </td>
                    <td>${(item.price * item.quantity).toFixed(2)}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => removeFromCart(item.bookID)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="table-secondary fw-bold">
                  <td colSpan={4} className="text-end">Total:</td>
                  <td colSpan={2}>${totalPrice.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="d-flex justify-content-between mt-3">
            <button className="btn btn-outline-danger" onClick={clearCart}>
              Clear Cart
            </button>
            <button className="btn btn-outline-secondary" onClick={handleContinueShopping}>
              &larr; Continue Shopping
            </button>
          </div>
        </>
      )}
    </div>
  );
}
