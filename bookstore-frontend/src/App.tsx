import { Route, Routes } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import AppNavbar from './components/AppNavbar';
import BookList from './components/BookList';
import CartPage from './components/CartPage';

function App() {
  return (
    <CartProvider>
      <AppNavbar />
      <Routes>
        <Route path="/" element={<BookList />} />
        <Route path="/cart" element={<CartPage />} />
      </Routes>
    </CartProvider>
  );
}

export default App;
