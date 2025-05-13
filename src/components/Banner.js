import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Banner.css';

import banner1 from '../assets/banner1.webp';
import banner2 from '../assets/banner2.avif';
import banner3 from '../assets/banner3.jpg';

const Banner = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  
  const banners = [
    {
      id: 8,
      src: banner3, 
      productName: 'Premium Electronics Sale',
      description: 'Up to 50% off on all premium electronics. Limited time offer!',
      price: 'Save Big',
      badge: '⭐ Limited Time Offer',
      buttonText: 'Shop Now',
      type: 'full'
    },
    {
      id: 46,
      src: banner2, 
      productName: 'Iphone 16 Pro',
      description: 'The ultimate gaming phone with high-refresh display and immersive sound.',
      price: '$999.00',
      badge: '⭐ Top Products Of the Month',
      buttonText: 'View Details',
      type: 'full'
    },
    {
      id: 1,
      src: banner1, 
      productName: 'Marhsal Speaker Black Rolex',
      description: 'Woburn II hits high trebles cleanly, handles low bass with ease and has a clear, lifelike mid range',
      price: '$555.00',
      badge: '⭐ Top Products Of the Month',
      buttonText: 'View Details',
      type: 'full'
    }
  ];
  
  // Handle automatic rotation
  const rotateSlide = useCallback(() => {
    if (!isTransitioning) {
      setIsTransitioning(true);
      setCurrentSlide((prev) => (prev + 1) % banners.length);
      
      setTimeout(() => setIsTransitioning(false), 600);
    }
  }, [banners.length, isTransitioning]);
  
  useEffect(() => {
    const interval = setInterval(rotateSlide, 2000);
    return () => clearInterval(interval);
  }, [rotateSlide]);
  
  // Handle navigation
  const handleViewDetails = (index) => {
    if (banners[index].type === 'full' && banners[index].id === 8) {
      navigate('/products');
    } else {
      navigate(`/product/${banners[index].id}`);
    }
  };
  
  const handleDotClick = (index) => {
    if (!isTransitioning && index !== currentSlide) {
      setIsTransitioning(true);
      setCurrentSlide(index);
      setTimeout(() => setIsTransitioning(false), 600);
    }
  };
  
  const handleNavClick = (direction) => {
    if (!isTransitioning) {
      setIsTransitioning(true);
      if (direction === 'prev') {
        setCurrentSlide(prev => (prev - 1 + banners.length) % banners.length);
      } else {
        setCurrentSlide(prev => (prev + 1) % banners.length);
      }
      setTimeout(() => setIsTransitioning(false), 600);
    }
  };
  
  // Touch handlers for swipe
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };
  
  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  
  const handleTouchEnd = () => {
    if (!isTransitioning) {
      if (touchStart - touchEnd > 75) {
        // Swipe left
        handleNavClick('next');
      }
      
      if (touchEnd - touchStart > 75) {
        // Swipe right
        handleNavClick('prev');
      }
    }
    // Reset values
    setTouchStart(0);
    setTouchEnd(0);
  };
  
  return (
    <div className="modern-banner"
         onTouchStart={handleTouchStart}
         onTouchMove={handleTouchMove}
         onTouchEnd={handleTouchEnd}>
      <div className="banner-full">
        <img 
          src={banners[currentSlide].src} 
          alt={banners[currentSlide].productName}
          loading={currentSlide === 0 ? "eager" : "lazy"}
          className={isTransitioning ? "transitioning" : ""}
        />
        <div className="banner-overlay">
          <div className="banner-content">
            {banners[currentSlide].badge && (
              <span className="badge">{banners[currentSlide].badge}</span>
            )}
            <h1>{banners[currentSlide].productName}</h1>
            <p>{banners[currentSlide].description}</p>
            <div className="banner-cta">
              <span className="banner-price">{banners[currentSlide].price}</span>
              <button 
                className="shop-btn" 
                onClick={() => handleViewDetails(currentSlide)}
              >
                {banners[currentSlide].buttonText} →
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="banner-indicators">
        {banners.map((_, index) => (
          <span
            key={index}
            className={`indicator ${currentSlide === index ? 'active' : ''}`}
            onClick={() => handleDotClick(index)}
          />
        ))}
      </div>
      
      <button
        className="nav-btn prev-btn"
        onClick={() => handleNavClick('prev')}
        aria-label="Previous slide"
      >
        ‹
      </button>
      <button
        className="nav-btn next-btn"
        onClick={() => handleNavClick('next')}
        aria-label="Next slide"
      >
        ›
      </button>
    </div>
  );
};

export default Banner;
