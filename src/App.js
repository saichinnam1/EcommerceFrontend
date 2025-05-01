import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import store from './store/store';
import { AuthProvider, AuthContext } from './components/AuthProvider';
import Navbar from './components/Navbar';
import AdminNavbar from './components/AdminNavbar';
import Banner from './components/Banner';
import Categories from './components/Categories';
import FeaturedProducts from './components/FeaturedProducts';
import About from './components/About';
import Policy from './components/Policy';
import Contact from './components/Contact';
import AuthPage from './components/AuthPage';
import ProductDetails from './components/ProductDetails';
import Cart from './components/Cart';
import OrderDetails from './components/OrderDetails';
import Checkout from './components/Checkout';
import Profile from './components/Profile';
import AddProduct from './components/AddProduct';
import AdminUsers from './components/AdminUsers';
import AdminDashboard from './components/AdminDashboard';
import Success from './components/Success';
import Search from './components/Search';
import ResetPassword from './components/ResetPassword';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

const queryClient = new QueryClient();

const ProtectedAdminRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  if (!user || !user.roles.includes('ADMIN')) {
    return <Navigate to="/auth" replace />;
  }
  return children;
};

const AppContent = () => {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.roles?.includes('ADMIN');
  const location = useLocation();

  return (
    <>
      {!isAdmin && location.pathname !== '/auth' && <Navbar />}
      {isAdmin && location.pathname !== '/auth' && <AdminNavbar />}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Banner />
              <Categories />
              <FeaturedProducts />
            </>
          }
        />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/policy" element={<Policy />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/search" element={<Search />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/order/:id" element={<OrderDetails />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedAdminRoute>
              <AdminDashboard />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/add-product"
          element={
            <ProtectedAdminRoute>
              <AddProduct />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedAdminRoute>
              <AdminUsers />
            </ProtectedAdminRoute>
          }
        />
        <Route path="/success" element={<Success />} />
        <Route path="/login" element={<Navigate to="/auth" replace />} />
        <Route path="/products" element={<FeaturedProducts />} />
        <Route path="/category/:category" element={<FeaturedProducts />} />
        <Route path="/auth/reset/:token" element={<ResetPassword />} /> {/* Updated path */}
        <Route path="/api/auth/failure" element={<Navigate to="/auth" replace />} />
      </Routes>
    </>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <Router>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </Router>
      </QueryClientProvider>
    </Provider>
  );
};

export default App;