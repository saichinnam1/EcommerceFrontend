import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { checkout } from '../services/api';
import { useNavigate, useLocation } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { CardElement, Elements, useStripe, useElements } from '@stripe/react-stripe-js';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import ProductImage from './ProductImage'; // Import the shared component
import background2 from '../assets/background2.jpg';
import '../styles/Checkout.css';

const stripePromise = loadStripe('pk_test_51RB9oeAeYqvaA1sJfh20ebWtetw7lB62LzeWMZE95HR56huoRmXnMEDOIe81hyuyofGYQfWlIYoDdxB0rCDk7MQr00k6QwLYGW');

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const userId = useSelector((state) => state.auth.user?.id);
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location;
  const { clientSecret, cart = [], total } = state || {};
  const [isValid, setIsValid] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({ fullName: '', streetAddress: '', city: '', postalCode: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentIntentId, setPaymentIntentId] = useState('');

  useEffect(() => {
    if (!clientSecret || !cart.length || !total || !userId) {
      toast.error('Invalid checkout data. Redirecting to cart...');
      navigate('/cart');
    } else {
      setIsValid(true);
    }
  }, [clientSecret, cart, total, userId, navigate]);

  const validatePostalCode = (postalCode) => {
    const postalCodeRegex = /^[0-9\s-]+$/;
    return postalCodeRegex.test(postalCode);
  };

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!stripe || !elements || !clientSecret) {
      setError('Stripe.js or payment intent is not loaded. Please refresh the page.');
      setLoading(false);
      return;
    }

    if (!shippingAddress.fullName || !shippingAddress.streetAddress || !shippingAddress.city || !shippingAddress.postalCode) {
      setError('All shipping address fields are required.');
      setLoading(false);
      return;
    }

    if (!validatePostalCode(shippingAddress.postalCode)) {
      setError('Postal code must contain only numbers, spaces, or hyphens.');
      setLoading(false);
      return;
    }

    const cardElement = elements.getElement(CardElement);
    const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: {
          name: shippingAddress.fullName,
          address: {
            line1: shippingAddress.streetAddress,
            city: shippingAddress.city,
            postal_code: shippingAddress.postalCode,
          },
        },
      },
    });

    if (stripeError) {
      setError(stripeError.message);
      setLoading(false);
      return;
    }

    if (paymentIntent) {
      setPaymentIntentId(paymentIntent.id);

      await delay(2000);

      const request = {
        userId,
        paymentIntentId: paymentIntent.id,
        shippingAddress: {
          fullName: shippingAddress.fullName,
          streetAddress: shippingAddress.streetAddress,
          city: shippingAddress.city,
          postalCode: shippingAddress.postalCode,
        },
        cartItems: cart.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: Math.round(item.price * 100),
        })),
      };
      try {
        const response = await checkout(request);
        if (response.status === 200) {
          toast.success('Payment completed successfully!', { autoClose: 2000 });
          navigate('/success', { replace: true });
        } else {
          setError(`Checkout failed: ${response.data?.message || 'Unknown error'}`);
        }
      } catch (err) {
        const errorMessage = err.message || 'Unknown error';
        setError(`Error during checkout: ${errorMessage}`);
        if (errorMessage.includes('Product not found')) {
          toast.error('Some products are unavailable. Please return to cart to clean up.');
          setTimeout(() => navigate('/cart', { replace: true }), 3000);
        } else if (errorMessage.includes('Price mismatch')) {
          toast.error('Price mismatch for some items. Please return to cart.');
          setTimeout(() => navigate('/cart', { replace: true }), 3000);
        } else if (errorMessage.includes('Postal code')) {
          toast.error('Invalid postal code. Please correct it and try again.');
        } else if (errorMessage.includes('Payment failed')) {
          toast.error('Payment processing failed. Please try again.');
        } else {
          toast.error('Checkout failed. Please try again later.');
        }
      }
    }
    setLoading(false);
  };

  if (!isValid) return null;

  return (
    <div className="checkout-container">
      <div className="checkout-grid">
        <div className="checkout-summary">
          <h2 className="checkout-title">Order Summary</h2>
          {cart.length > 0 ? (
            <div className="order-items">
              {cart.map((item, index) => (
                <div key={index} className="order-item">
                  <div className="product-image">
                    <ProductImage
                      src={item.imageUrl || '/placeholder.jpg'}
                      alt={item.name}
                      style={{
                        width: '200px',
                        height: '200px',
                        objectFit: 'cover',
                      }}
                    />
                  </div>
                  <div className="item-details">
                    <h4>{item.name}</h4>
                    <div className="item-meta">
                      <span>Qty: {item.quantity}</span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-cart">No items in cart.</p>
          )}
          <div className="order-total">
            <div className="total-line">
              <span>Subtotal</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="total-line">
              <span>Shipping</span>
              <span><span className="badge bg-success">Free</span></span>
            </div>
            <div className="total-line total-final">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="checkout-form">
          <h2 className="checkout-title">Payment Details</h2>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <h3>📍 Shipping Information</h3>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={shippingAddress.fullName}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div className="form-group">
                <label>Street Address</label>
                <input
                  type="text"
                  value={shippingAddress.streetAddress}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, streetAddress: e.target.value })}
                  placeholder="Enter your street address"
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                    placeholder="City"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Postal Code</label>
                  <input
                    type="text"
                    value={shippingAddress.postalCode}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                    placeholder="Postal code"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>💳 Payment Method</h3>
              <div className="form-group card-element-container">
                <CardElement
                  options={{
                    style: {
                      base: {
                        fontSize: '16px',
                        color: '#424770',
                        fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
                        '::placeholder': {
                          color: '#aab7c4',
                        },
                      },
                      invalid: {
                        color: '#9e2146',
                      },
                    },
                    hidePostalCode: true,
                  }}
                />
              </div>
              <div className="form-group payment-id-field">
                <label>Payment Intent ID</label>
                <input
                  type="text"
                  value={paymentIntentId}
                  readOnly
                  className="payment-intent-id"
                />
              </div>
            </div>

            <div className="checkout-actions">
              <Link to="/cart" className="back-button">
                ← Back to Cart
              </Link>
              <button
                type="submit"
                className={`place-order-button ${loading ? 'loading' : ''}`}
                disabled={loading || !stripe || !clientSecret}
              >
                {loading ? 'Processing...' : 'Complete Payment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const Checkout = () => {
  return (
    <div className="checkout-page" style={{ backgroundImage: `url(${background2})` }}>
      <Elements stripe={stripePromise}>
        <CheckoutForm />
      </Elements>
    </div>
  );
};

export default Checkout;