import React, { useEffect, useRef } from 'react';
import { Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useQuery } from '@tanstack/react-query';
import { getProducts, getProductsByCategory, addToCart } from '../services/api';
import api from '../services/api';
import freeShippingImage from '../assets/free-shipping.png';
import securePaymentImage from '../assets/secure-payment.png';
import supportOnlineImage from '../assets/support-online.png';
import '../styles/FeaturedProducts.css';

const SkeletonLoader = () => (
  <div className="product-grid">
    {[...Array(8)].map((_, index) => (
      <div className="product-item" key={index}>
        <div className="product-card skeleton">
          <div className="product-image-wrapper skeleton-image"></div>
          <div className="product-content">
            <div className="skeleton-text skeleton-title"></div>
            <div className="skeleton-text skeleton-price"></div>
            <div className="skeleton-button"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

const ProductImage = ({ src, alt }) => {
  const [isImageLoaded, setIsImageLoaded] = React.useState(false);
  const placeholder = '/placeholder.jpg';

  return (
    <>
      {!isImageLoaded && (
        <img
          src={placeholder}
          className="product-image"
          alt={alt}
          style={{ opacity: 0.5 }}
        />
      )}
      <img
        src={src}
        className="product-image"
        alt={alt}
        onLoad={() => setIsImageLoaded(true)}
        onError={(e) => {
          e.target.src = placeholder;
          setIsImageLoaded(true);
        }}
        style={{
          display: isImageLoaded ? 'block' : 'none',
        }}
      />
    </>
  );
};

const FeaturedProducts = () => {
  const { category } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get('query');
  const productGridRef = useRef(null);

  const fetchProducts = async () => {
    if (query) {
      const response = await api.get(`/search?query=${encodeURIComponent(query)}`);
      return response.data;
    }
    if (category) {
      return (await getProductsByCategory(category)).data;
    }
    return (await getProducts()).data;
  };

  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products', category, query],
    queryFn: fetchProducts,
    retry: 1,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const handleAddToCart = async (product) => {
    if (!user) {
      toast.error('Please log in to add items to your cart.');
      navigate('/login');
      return;
    }

    try {
      const cartItem = {
        userId: user.id,
        productId: product.id,
        quantity: 1,
      };
      const response = await addToCart(cartItem);
      if (response.status === 200) {
        toast.success(`${product.name} added to cart!`);
      }
    } catch (err) {
      console.error('Error adding to cart:', err.response?.data || err.message);
      const errorMessage = err.response?.data?.message || 'Failed to add item to cart.';
      toast.error(errorMessage);
    }
  };

  useEffect(() => {
    if (location.pathname === '/products') {
      window.scrollTo({ top: 7, behavior: 'smooth' });
    }
  }, [location]);

  const renderProductGrid = () => {
    if (isLoading) return <SkeletonLoader />;
    if (error) return (
      <div className="error-container">
        <div className="error-message">Failed to load products: {error.message}</div>
      </div>
    );
    if (!products?.length) return (
      <div className="empty-container">
        <div className="empty-message">No products available.</div>
      </div>
    );

    const displayedProducts = location.pathname === '/' ? products.slice(0, 8) : products;

    return (
      <div ref={productGridRef} className="product-grid">
        {displayedProducts.map((product) => (
          <div className="product-item" key={product.id}>
            <div className="product-card">
              <div className="product-image-wrapper">
                <ProductImage
                  src={product.imageUrl || '/placeholder.jpg'}
                  alt={product.name || 'Product Image'}
                />
              </div>
              <div className="product-content">
                <h3 className="product-name">{product.name}</h3>
                <div className="product-price">${product.price?.toFixed(2)}</div>
                <div className="button-group">
                  <Link to={`/product/${product.id}`} className="view-details-btn">
                    View Details
                  </Link>
                  <button
                    className="add-to-cart-btn"
                    onClick={() => handleAddToCart(product)}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderHomePageSections = () => {
    if (location.pathname !== '/') return null;

    return (
      <>
        {products?.length > 0 && (
          <div className="view-all-container">
            <Link to="/products" className="view-all-btn">
              View All Products
            </Link>
          </div>
        )}
        <div className="info-section">
          <div className="info-cards">
            <div className="info-card">
              <img src={freeShippingImage} alt="Free Shipping" className="info-icon" />
              <h4>Free Shipping</h4>
              <p>Our Free shipping policy applies to all orders, regardless of order value or destination.</p>
            </div>
            <div className="info-card">
              <img src={securePaymentImage} alt="Secure Payments" className="info-icon" />
              <h4>Secure Payments</h4>
              <p>Your payments are always safe, secure, and protected at all times.</p>
            </div>
            <div className="info-card">
              <img src={supportOnlineImage} alt="Support Online" className="info-icon" />
              <h4>Support Online 24/7</h4>
              <p>We are available 24/7 to assist with any questions or issues you may have.</p>
            </div>
          </div>

          <div className="newsletter-section">
            <h3>Join Us & Get Updates</h3>
            <div className="newsletter-input-group">
              <input
                type="email"
                className="form-control"
                placeholder="Enter your email"
                aria-label="Email"
              />
              <button className="subscribe-btn">Subscribe</button>
            </div>
            <p className="small-text">
              Sign up for exclusive offers, latest news and updates
            </p>
          </div>
        </div>

        <footer className="footer-section">
          <div className="footer-content">
            <div className="footer-bottom">
              <p>By Venkata Saikumar Chinnam</p>
              <p>Founder of Tecno Titans</p>
              <div className="footer-nav">
                <Link to="/about">About</Link> | <Link to="/policy">Privacy Policy</Link> |{' '}
                <Link to="/contact">Contact</Link>
              </div>
            </div>
          </div>
        </footer>
      </>
    );
  };

  return (
    <div className="container">
      <div className="featured-header">
        <h2 className="featured-title">
          {query
            ? 'Search Results'
            : category
            ? `${category.charAt(0).toUpperCase() + category.slice(1)} Products`
            : location.pathname === '/products'
            ? 'All Products'
            : 'Products'}
        </h2>
      </div>

      {renderProductGrid()}
      {renderHomePageSections()}
    </div>
  );
};

export default FeaturedProducts;