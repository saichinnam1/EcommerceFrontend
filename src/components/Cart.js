import React, { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getCart, updateCart, removeFromCart, createPaymentIntent, getProducts } from '../services/api';
import { API_URL } from '../Config/config';
import '../styles/Cart.css';

const EmptyCartIcon = () => (
  <svg width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 6H21" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 10C16 11.0609 15.5786 12.0783 14.8284 12.8284C14.0783 13.5786 13.0609 14 12 14C10.9391 14 9.92172 13.5786 9.17157 12.8284C8.42143 12.0783 8 11.0609 8 10" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="9" y1="18" x2="15" y2="18" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const ProductImage = ({ src, alt }) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const placeholder = '/placeholder.jpg';

  return (
    <div className="cart-item-image-container">
      {!isImageLoaded && (
        <div className="cart-item-image-placeholder">
          <div className="loading-pulse"></div>
        </div>
      )}
      <img
        src={src}
        className="cart-item-image"
        alt={alt}
        onLoad={() => setIsImageLoaded(true)}
        onError={(e) => {
          e.target.src = placeholder;
          setIsImageLoaded(true);
        }}
        style={{ opacity: isImageLoaded ? 1 : 0 }}
      />
    </div>
  );
};

const Cart = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Centralized authentication check
  const isAuthenticated = useCallback(() => {
    const isValid = user && user.id && !isNaN(user.id);
    if (!isValid) {
      console.warn('Authentication check failed:', user); // Debug invalid user
    }
    return isValid;
  }, [user]);

  // Dynamic authentication check
  useEffect(() => {
    if (!isAuthenticated()) {
      toast.error('Session expired. Please log in again.');
      navigate('/auth');
    }
  }, [user, navigate, isAuthenticated]);

  // Fetch cart data when user changes
  useEffect(() => {
    if (!isAuthenticated()) {
      toast.error('Please log in to view your cart.');
      navigate('/auth');
      return;
    }

    const fetchCart = async () => {
      try {
        console.log('Fetching cart for user:', user); // Debug user on fetch
        const response = await getCart(user.id);
        const items = response.data.items || [];
        const mappedItems = items.map(item => {
          const product = item.product || {};
          return {
            cartId: item.id,
            id: product.id || null,
            name: product.name || 'Unnamed Product',
            price: typeof product.price === 'number' ? product.price : 0,
            quantity: typeof item.quantity === 'number' ? item.quantity : 1,
            imageUrl: product.imageUrl ? `${API_URL.replace('/api', '')}/Uploads/${product.imageUrl}` : '/placeholder.jpg',
          };
        }).filter(item => item.id !== null);

        try {
          const productsResponse = await getProducts();
          const serverProducts = productsResponse.data;
          const updatedItems = mappedItems.map(item => {
            const serverProduct = serverProducts.find(p => p.id === item.id);
            return serverProduct ? {
              ...item,
              price: serverProduct.price,
              name: serverProduct.name,
              imageUrl: serverProduct.imageUrl ? `${API_URL.replace('/api', '')}/Uploads/${serverProduct.imageUrl}` : '/placeholder.jpg',
            } : null;
          }).filter(item => item !== null);

          if (updatedItems.length < mappedItems.length) {
            toast.warn('Some cart items were removed as they are no longer available.');
          }
          setCartItems(updatedItems);
        } catch (error) {
          setCartItems(mappedItems);
          toast.error('Failed to validate product availability.');
        }
      } catch (error) {
        toast.error(`Failed to load cart: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [user, navigate, isAuthenticated]);

  const handleQuantityChange = async (cartId, quantity) => {
    if (!isAuthenticated()) {
      toast.error('Please log in to update your cart.');
      navigate('/auth');
      return;
    }
    console.log('User object before update:', user); // Debug user before update
    if (!user.id) {
      toast.error('Invalid user session. Please log in again.');
      navigate('/auth');
      return;
    }
    if (!cartId || isNaN(cartId)) {
      toast.error('Cart item ID is invalid. Please refresh the page.');
      return;
    }
    if (isNaN(quantity) || quantity < 0) {
      toast.error('Quantity is invalid. Please enter a positive number.');
      return;
    }

    try {
      const payload = { userId: user.id, itemId: cartId, quantity };
      console.log('Sending updateCart payload:', payload); // Debug payload
      const response = await updateCart(payload);
      const data = response.data;

      if (quantity <= 0 || (data.success && data.message && data.message.includes('removed'))) {
        setCartItems((prev) => prev.filter((i) => i.cartId !== cartId));
        toast.success('Item removed');
      } else {
        setCartItems((prev) =>
          prev.map((i) => (i.cartId === cartId ? { ...i, quantity } : i))
        );
        toast.success('Cart updated');
      }
    } catch (error) {
      toast.error(`Failed to update quantity: ${error.message}`);
      const response = await getCart(user.id);
      const items = response.data.items || [];
      const mappedItems = items.map(item => {
        const product = item.product || {};
        return {
          cartId: item.id,
          id: product.id || null,
          name: product.name || 'Unnamed Product',
          price: typeof product.price === 'number' ? product.price : 0,
          quantity: typeof item.quantity === 'number' ? item.quantity : 1,
          imageUrl: product.imageUrl ? `${API_URL.replace('/api', '')}/Uploads/${product.imageUrl}` : '/placeholder.jpg',
        };
      }).filter(item => item.id !== null);
      setCartItems(mappedItems);
    }
  };

  const handleRemoveItem = async (cartId) => {
    if (!isAuthenticated()) {
      toast.error('Please log in to remove items from your cart.');
      navigate('/auth');
      return;
    }
    if (!cartId || isNaN(cartId)) {
      toast.error('Cart item ID is invalid. Please refresh the page.');
      return;
    }

    try {
      await removeFromCart(cartId, user.id);
      setCartItems((prev) => prev.filter((item) => item.cartId !== cartId));
      toast.success('Item removed');
    } catch (error) {
      toast.error(`Failed to remove item: ${error.message}`);
    }
  };

  const calculateTotal = (items = cartItems) => {
    return items.reduce((sum, item) => {
      const price = typeof item.price === 'number' ? item.price : 0;
      const quantity = typeof item.quantity === 'number' ? item.quantity : 1;
      return sum + (price * quantity);
    }, 0);
  };

  const handleCheckout = async () => {
    if (!cartItems.length) {
      toast.error('Your cart is empty.');
      return;
    }

    if (!isAuthenticated()) {
      toast.error('Please log in to proceed with checkout.');
      navigate('/auth');
      return;
    }

    if (isCheckingOut) {
      toast.info('Checkout is already in progress.');
      return;
    }

    setIsCheckingOut(true);

    try {
      const response = await getProducts();
      const serverProducts = response.data;

      const updatedCartItems = cartItems.map(item => {
        const serverProduct = serverProducts.find(p => p.id === item.id);
        return serverProduct ? {
          ...item,
          price: serverProduct.price,
          name: serverProduct.name,
          imageUrl: serverProduct.imageUrl ? `${API_URL.replace('/api', '')}/Uploads/${serverProduct.imageUrl}` : '/placeholder.jpg',
        } : null;
      }).filter(item => item !== null);

      if (updatedCartItems.length === 0) {
        toast.error('No valid items in cart');
        return;
      }

      setCartItems(updatedCartItems);

      const validCartItems = updatedCartItems.filter(item => 
        item.id && 
        typeof item.price === 'number' && 
        item.price > 0 && 
        typeof item.quantity === 'number' && 
        item.quantity > 0
      );

      if (validCartItems.length === 0) {
        toast.error('No valid items in cart');
        return;
      }

      const totalInDollars = calculateTotal(validCartItems);
      if (totalInDollars <= 0 || isNaN(totalInDollars)) {
        toast.error('Invalid cart total');
        return;
      }

      const totalInCents = Math.round(totalInDollars * 100);
      const payload = {
        userId: user.id,
        amount: totalInCents,
        currency: 'usd',
        items: validCartItems.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: Math.round(item.price * 100),
        })),
      };

      const paymentIntentResponse = await createPaymentIntent(payload);
      navigate('/checkout', {
        state: {
          clientSecret: paymentIntentResponse.data.clientSecret,
          cart: validCartItems,
          total: totalInDollars,
        },
      });
    } catch (error) {
      toast.error(`Checkout error: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
      setIsCheckingOut(false);
    }
  };

  if (loading) return (
    <div className="cart-loading">
      <div className="loading-spinner"></div>
      <p>Loading your cart...</p>
    </div>
  );
  
  if (!cartItems.length) return (
    <div className="cart-empty-container">
      <EmptyCartIcon />
      <h2>Your cart is empty</h2>
      <p>Find something you'll love in our collection</p>
      <Link to="/" className="start-shopping-btn">Browse Products</Link>
    </div>
  );

  return (
    <div className="cart-page">
      <div className="cart-container">
        <h2>Shopping Cart <span className="cart-item-count">{cartItems.length} item{cartItems.length !== 1 ? 's' : ''}</span></h2>
        
        <div className="cart-layout">
          <div className="cart-items-container">
            {cartItems.map((item) => (
              <div className="cart-item" key={item.cartId}>
                <ProductImage
                  src={item.imageUrl}
                  alt={item.name}
                />
                
                <div className="cart-item-content">
                  <div className="cart-item-details">
                    <h3>{item.name}</h3>
                    <p className="item-price">${item.price?.toFixed(2) || '0.00'}</p>
                  </div>
                  
                  <div className="cart-item-actions">
                    <div className="quantity-control">
                      <button 
                        className="quantity-btn"
                        aria-label="Decrease quantity"
                        onClick={() => handleQuantityChange(item.cartId, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </button>
                      <span className="quantity-value">{item.quantity}</span>
                      <button 
                        className="quantity-btn"
                        aria-label="Increase quantity"
                        onClick={() => handleQuantityChange(item.cartId, item.quantity + 1)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </button>
                    </div>
                    
                    <div className="cart-item-subtotal">
                      <p className="subtotal-value">${(item.price * item.quantity).toFixed(2) || '0.00'}</p>
                    </div>
                  </div>
                  
                  <button 
                    className="remove-btn" 
                    aria-label="Remove item"
                    onClick={() => handleRemoveItem(item.cartId)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="cart-summary">
            <h3>Order Summary</h3>
            <div className="cart-summary-row">
              <span>Subtotal</span>
              <span>${calculateTotal().toFixed(2)}</span>
            </div>
            <div className="cart-summary-row">
              <span>Shipping</span>
              <span>Calculated at checkout</span>
            </div>
            
            <div className="cart-summary-row total">
              <span>Total</span>
              <span>${calculateTotal().toFixed(2)}</span>
            </div>
            
            <button 
              className="checkout-btn" 
              onClick={handleCheckout} 
              disabled={loading || isCheckingOut}
            >
              {loading || isCheckingOut ? 'Processing...' : 'Checkout'}
            </button>
            
            <Link to="/" className="continue-shopping-link">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;