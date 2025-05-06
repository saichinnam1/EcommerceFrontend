import React, { useState } from 'react';
import { fixImageUrl } from '../services/api';

const ProductImage = ({ src, alt, className, style }) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const placeholder = '/placeholder.jpg';
  const imageUrl = fixImageUrl(src);

  return (
    <div className="product-image-container" style={{ position: 'relative' }}>
      {!isImageLoaded && (
        <div className="image-placeholder" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
          <div className="loading-pulse" style={{ width: '100%', height: '100%', background: '#e0e0e0', animation: 'pulse 1.5s infinite' }}></div>
        </div>
      )}
      <img
        src={imageUrl}
        className={className || 'product-image'}
        alt={alt || 'Product Image'}
        style={{
          ...style,
          opacity: isImageLoaded ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out',
        }}
        onLoad={() => {
          console.log(`Successfully loaded image: ${imageUrl}`);
          setIsImageLoaded(true);
        }}
        onError={(e) => {
          console.error(`Failed to load image: ${imageUrl}`);
          e.target.src = placeholder;
          setIsImageLoaded(true);
        }}
      />
      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default ProductImage;