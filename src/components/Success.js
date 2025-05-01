import React from 'react';
import { Link } from 'react-router-dom';

const Success = () => {
  return (
    <div className="container my-5 text-center">
      <h2 className="mb-4">Order Successful!</h2>
      <p>Thank you for your purchase. Your order has been placed successfully.</p>
      
      <Link
        to="/"
        className="btn mt-3"
        style={{
          backgroundColor: '#90ee90', 
          color: '#fff', 
          padding: '0.25rem 0.75rem', 
          fontSize: '0.9rem', 
          borderRadius: '5px', 
          textDecoration: 'none', 
        }}
      >
        Continue Shopping
      </Link>
    </div>
  );
};

export default Success;