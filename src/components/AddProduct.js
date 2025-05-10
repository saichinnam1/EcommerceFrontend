import React, { useState } from 'react';
import { addProduct } from '../services/api';
import { useNavigate } from 'react-router-dom';
import '../styles/AddProduct.css';

const AddProduct = () => {
  const [product, setProduct] = useState({ name: '', description: '', price: '', category: '', file: null });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('file', product.file);
    formData.append('name', product.name);
    formData.append('description', product.description);
    formData.append('price', product.price);
    formData.append('category', product.category);
    await addProduct(formData);
    navigate('/products');
  };

  return (
    <div className="add-product-form">
      <h2>Add Product</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name</label>
          <input
            className="form-control"
            value={product.name}
            onChange={(e) => setProduct({ ...product, name: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea
            className="form-control"
            value={product.description}
            onChange={(e) => setProduct({ ...product, description: e.target.value })}
            rows="3"
          />
        </div>
        <div className="form-group">
          <label>Price</label>
          <input
            type="number"
            className="form-control"
            value={product.price}
            onChange={(e) => setProduct({ ...product, price: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Category</label>
          <select
            className="form-control"
            value={product.category}
            onChange={(e) => setProduct({ ...product, category: e.target.value })}
          >
            <option value="">Select Category</option>
            <option value="Laptop">Laptop</option>
            <option value="Phone">Phone</option>
            <option value="Camera">Camera</option>
            <option value="Headphone">Headphone</option>
            <option value="Video Game">Video Game</option>
          </select>
        </div>
        <div className="form-group">
          <label>Image</label>
          <input
            type="file"
            className="form-control"
            onChange={(e) => setProduct({ ...product, file: e.target.files[0] })}
          />
        </div>
        <button type="submit" className="btn-primary">Add Product</button>
      </form>
    </div>
  );
};

export default AddProduct;