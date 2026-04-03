import { Route, Routes } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import AppNavbar from './components/AppNavbar';
import BookList from './components/BookList';
import CartPage from './components/CartPage';
import AdminBooks from './components/AdminBooks';

function App() {
  return (
    <CartProvider>
      <AppNavbar />
      <Routes>
        <Route path="/" element={<BookList />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/adminbooks" element={<AdminBooks />} />
      </Routes>
    </CartProvider>
  );
}

export default App;
