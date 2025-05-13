import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLaptop, faMobileAlt, faCamera, faHeadphones, faGamepad } from '@fortawesome/free-solid-svg-icons';
import '../styles/Categories.css';

const Categories = () => {
  const categories = [
    { name: 'Laptop', icon: faLaptop, color: '#4299e1', path: '/category/laptop' },
    { name: 'Phone', icon: faMobileAlt, color: '#4CAF50', path: '/category/phone' },
    { name: 'Camera', icon: faCamera, color: '#f56565', path: '/category/camera' },
    { name: 'Headphone', icon: faHeadphones, color: '#9f7aea', path: '/category/headphone' },
    { name: 'Video Game', icon: faGamepad, color: '#ecc94b', path: '/category/videogame' },
  ];

  return (
    <div className="categories-container">
      <div className="categories-header">
        <h2 className="categories-title">Browse by Category</h2>
      </div>
      
      <div className="categories-grid">
        {categories.map((category, index) => (
          <Link 
            to={category.path} 
            className="category-card" 
            key={index}
          >
            <div 
              className="category-icon-wrapper" 
              style={{ 
                backgroundColor: `${category.color}15`,
                border: `1px solid ${category.color}30`
              }}
            >
              <FontAwesomeIcon 
                icon={category.icon} 
                className="category-icon" 
                style={{ color: category.color }} 
              />
            </div>
            <p className="category-name">{category.name}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Categories;
