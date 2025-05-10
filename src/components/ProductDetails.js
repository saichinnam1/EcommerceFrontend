import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getProductById, addToCart, createPaymentIntent } from '../services/api';
import backgroundImage from '../assets/background.jpg';
import '../styles/ProductDetails.css';

const ProductImage = ({ src, alt }) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const placeholder = '/placeholder.jpg';

  
  const optimizedSrc = src.includes('cloudinary') 
    ? `${src.split('/upload/')[0]}/upload/w_200,h_200,c_fill,q_auto/${src.split('/upload/')[1]}`
    : src;

  return (
    <>
      {!isImageLoaded && (
        <img
          src={placeholder}
          className="pd-product-image"
          alt={alt}
          style={{ opacity: 0.5 }}
        />
      )}
      <img
        src={optimizedSrc}
        className="pd-product-image"
        alt={alt}
        onLoad={() => {
          console.log('Image loaded successfully:', optimizedSrc);
          setIsImageLoaded(true);
        }}
        onError={(e) => {
          console.error('Failed to load image:', optimizedSrc);
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

const ProductBenefits = () => {
  return (
    <div className="pd-benefits-section">
      <div className="pd-benefits-container">
        <div className="pd-benefit-item">
          <div className="pd-benefit-icon">
            <i className="bi bi-truck"></i>
          </div>
          <div className="pd-benefit-text">
            <h6>Free Shipping</h6>
            <p>On all orders</p>
          </div>
        </div>
        
        <div className="pd-benefit-item">
          <div className="pd-benefit-icon">
            <i className="bi bi-arrow-clockwise"></i>
          </div>
          <div className="pd-benefit-text">
            <h6>30-Day Returns</h6>
            <p>Money back guarantee</p>
          </div>
        </div>
        
        <div className="pd-benefit-item">
          <div className="pd-benefit-icon">
            <i className="bi bi-shield-check"></i>
          </div>
          <div className="pd-benefit-text">
            <h6>2-Year Warranty</h6>
            <p>Full coverage</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const userId = useSelector((state) => state.auth.user?.id);

  useEffect(() => {
    getProductById(id)
      .then((response) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('Fetched product:', response.data);
        }
        setProduct(response.data);
      })
      .catch((error) => {
        console.error('Error fetching product:', error);
        toast.error('Failed to load product. Please try again.');
      });
  }, [id]);

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setIsAdding(true);
    addToCart({ userId, productId: product.id, quantity })
      .then(() => {
        setTimeout(() => {
          setIsAdding(false);
          toast.success('Added to cart!');
        }, 800);
      })
      .catch((error) => {
        console.error('Error adding to cart:', error);
        setIsAdding(false);
        toast.error('Failed to add to cart. Please try again.');
      });
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated || !userId) {
      toast.error('Please log in to proceed.');
      navigate('/login');
      return;
    }
    if (!product || !quantity || product.id < 1 || product.price <= 0) {
      toast.error('Invalid product or quantity. Please try again.');
      navigate('/cart');
      return;
    }

    setIsAdding(true);
    try {
      const totalInDollars = product.price * quantity;
      if (totalInDollars <= 0 || isNaN(totalInDollars)) {
        toast.error('Invalid product total. Please try again.');
        return;
      }
      const totalInCents = Math.round(totalInDollars * 100);
      const payload = {
        userId,
        amount: totalInCents,
        currency: 'usd',
        items: [
          {
            productId: product.id,
            quantity,
            price: Math.round(product.price * 100),
          },
        ],
      };

      const paymentIntentResponse = await createPaymentIntent(payload);
      const cartItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity,
        imageUrl: product.imageUrl || '/placeholder.jpg',
      };
      navigate('/checkout', {
        state: {
          clientSecret: paymentIntentResponse.data.clientSecret,
          cart: [cartItem],
          total: totalInDollars,
        },
      });
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Unknown error';
      toast.error(`Error during purchase: ${errorMessage}`);
    } finally {
      setIsAdding(false);
    }
  };

  const handleQuantityChange = (change) => {
    setQuantity((prev) => Math.max(1, prev + change));
  };

  if (!product) {
    return (
      <div className="pd-loading-container">
        <div className="pd-spinner"></div>
        <p>Loading product details...</p>
      </div>
    );
  }

  const imageUrl = product.imageUrl || '/placeholder.jpg';

  return (
    <div className="pd-page-container" style={{ backgroundImage: `url(${backgroundImage})` }}>
      <div className="pd-main-container">
        <div className="pd-product-card">
          <div className="pd-row">
            <div className="pd-col-left">
              <div className="pd-image-container">
                <ProductImage src={imageUrl} alt={product.name || 'Product Image'} />
                
                <div className="pd-product-badges">
                  {product.isNew && <span className="pd-badge pd-badge-new">New</span>}
                  {product.discount > 0 && <span className="pd-badge pd-badge-sale">Sale</span>}
                </div>
              </div>
            </div>
            
            <div className="pd-col-right">
              <h1 className="pd-product-title">{product.name}</h1>
              
              <div className="pd-product-price-container">
                <h2 className="pd-product-price">${product.price}</h2>
                {product.oldPrice && (
                  <span className="pd-product-old-price">${product.oldPrice}</span>
                )}
              </div>
              
              <p className="pd-product-description">
                {product.description}
              </p>
              
              <div className="pd-quantity-selector">
                <button
                  className="pd-qty-btn"
                  onClick={() => handleQuantityChange(-1)}
                >
                  <i className="bi bi-dash"></i>
                </button>
                <span className="pd-qty-value">{quantity}</span>
                <button
                  className="pd-qty-btn"
                  onClick={() => handleQuantityChange(1)}
                >
                  <i className="bi bi-plus"></i>
                </button>
              </div>
              
              <div className="pd-actions-container">
                <button
                  className="pd-action-btn pd-btn-buy-now"
                  onClick={handleBuyNow}
                  disabled={isAdding}
                >
                  <i className="bi bi-lightning-charge"></i>
                  {isAdding ? 'Processing...' : 'Buy Now'}
                </button>
                <button
                  className="pd-action-btn pd-btn-add-to-cart"
                  onClick={handleAddToCart}
                  disabled={isAdding}
                >
                  <i className="bi bi-cart-plus"></i>
                  {isAdding ? 'Adding...' : 'Add to Cart'}
                </button>
              </div>
              
              <ProductBenefits />
              
              <div className="pd-additional-info">
                <div className="pd-stock-info">
                  <i className="bi bi-check-circle-fill"></i>
                  <span>In Stock</span>
                </div>
                
                {product.sku && (
                  <div className="pd-sku-info">
                    <span className="pd-info-label">SKU:</span> 
                    <span>{product.sku}</span>
                  </div>
                )}
                
                {product.categories && product.categories.length > 0 && (
                  <div className="pd-category-info">
                    <span className="pd-info-label">Categories:</span> 
                    <span>{product.categories.join(', ')}</span>
                  </div>
                )}
              </div>
              
              <div className="pd-secure-checkout">
                <div className="pd-secure-title">
                  <i className="bi bi-lock-fill"></i>
                  <span>Secure Checkout</span>
                </div>
                <div className="pd-payment-methods">
                  <i className="bi bi-credit-card"></i>
                  <i className="bi bi-paypal"></i>
                  <i className="bi bi-wallet2"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;