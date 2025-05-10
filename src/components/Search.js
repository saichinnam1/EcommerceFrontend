import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { searchProducts } from '../services/api';
import '../styles/Search.css';

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const query = new URLSearchParams(location.search).get('query');
    if (query) {
      setSearchQuery(query);
      if (searchPerformed) {
        fetchProducts(query);
      }
    }
  }, [location, searchPerformed]);

  const fetchProducts = async (query) => {
    setLoading(true);
    try {
      const response = await searchProducts(query);
      console.log('Search response:', response.data);
      setProducts(response.data || []);
    } catch (error) {
      console.error('Error fetching search results:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchPerformed(true);
      navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
      fetchProducts(searchQuery);
    }
  };

  const handleViewDetails = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleBuyNow = (product) => {
    navigate(`/product/${product.id}`, { state: { buyNow: true } });
  };

  return (
    <div className="search-container">
      <h2>Search Products</h2>
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Enter product name or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
          autoFocus
        />
        <button type="submit" className="search-btn" aria-label="Search">
          <i className="bi bi-search"></i>
        </button>
      </form>

      {loading && <div className="loading">Loading...</div>}
      {!loading && products.length === 0 && searchQuery && searchPerformed && (
        <div className="no-results">No products found for "{searchQuery}"</div>
      )}
      {!loading && products.length > 0 && (
        <div className="product-grid">
          {products.map((product) => {
            const imageUrl = product.imageUrl || '/placeholder.jpg';
            // Apply Cloudinary transformation for optimization (resize to 200x200, auto quality)
            const optimizedSrc = imageUrl.includes('cloudinary') 
              ? `${imageUrl.split('/upload/')[0]}/upload/w_200,h_200,c_fill,q_auto/${imageUrl.split('/upload/')[1]}`
              : imageUrl;

            return (
              <div key={product.id} className="product-card">
                <img
                  src={optimizedSrc}
                  alt={product.name}
                  className="product-image"
                  onError={(e) => { e.target.src = '/placeholder.jpg'; }}
                />
                <h3>{product.name}</h3>
                <p>{product.description.substring(0, 100)}...</p>
                <p>${product.price}</p>
                <div className="product-actions">
                  <button
                    className="view-details-btn"
                    onClick={() => handleViewDetails(product.id)}
                  >
                    View Details
                  </button>
                  <button
                    className="buy-now-btn"
                    onClick={() => handleBuyNow(product)}
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Search;