import React, { useState } from 'react';
import { API_URL } from '../Config/config';
import '../styles/Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await response.text();
      setSubmitStatus(data);
      if (response.ok) {
        setFormData({ name: '', email: '', message: '' });
      }
    } catch (error) {
      setSubmitStatus('Failed to submit message: ' + error.message);
    }
  };

  return (
    <div className="contact-container">
      <div className="contact-content text-center">
        <h1 className="contact-title">Let's Talk !</h1>
        <p className="contact-subtitle">I would love to connect with you.</p>

        <div className="contact-info">
          <div className="info-item">
            <i className="fas fa-phone contact-icon"></i>
            <p>
              <strong>Call me at</strong><br />
              +91 9157575559
            </p>
          </div>
          
          <div className="info-item">
            <i className="fas fa-map-marker-alt contact-icon"></i>
            <p>
              <strong>Hyderabad</strong><br />
              KPHB
            </p>
          </div>
          <div className="info-item">
            <i className="fas fa-envelope contact-icon"></i>
            <p>
              <strong>Email me at</strong><br />
              venkatasaikumarchinnam1@gmail.com
            </p>
          </div>
        </div>

        <div className="contact-form">
          <h2 className="form-title">Contact</h2>
          <p className="form-subtitle">You can contact me through this form and I’ll get back to you as soon as possible</p>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <input
                type="text"
                className="form-control"
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <input
                type="email"
                className="form-control"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <textarea
                className="form-control"
                name="message"
                placeholder="Message"
                value={formData.message}
                onChange={handleChange}
                rows="4"
                required
              ></textarea>
            </div>
            <button type="submit" className="btn submit-btn">
              Submit
            </button>
            {submitStatus && <p className="text-center mt-2">{submitStatus}</p>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;