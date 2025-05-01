import React from 'react';

const About = () => {
  return (
    <div className="container my-4">
      <h2 className="text-3xl font-bold mb-4">About Us</h2>
      <p className="text-lg mb-6">
        Welcome to TechnoTitans, where innovation meets excellence! At TechnoTitans, we’re driven by a passion for technology and a commitment to delivering the latest and greatest in electronics. From cutting-edge smartphones and powerful laptops to smart home solutions and must-have accessories, we bring you a curated selection of top-tier gadgets designed to elevate your lifestyle.
        Founded with a bold vision to make technology accessible and exciting, we strive to empower our customers with high-quality products, unbeatable prices, and a shopping experience that’s second to none. Our team works tirelessly to partner with trusted global brands, ensuring every item we offer meets the highest standards of performance and reliability.
      </p>
      <div className="mt-6">
        <p className="text-lg">
          <strong>Contact Us:</strong> Reach out at{' '}
          <a href="mailto:support@technotitans.com" className="text-blue-600 hover:underline">
            support@technotitans.com
          </a>
        </p>
        <p className="text-lg mt-2">
          <strong>Follow Us:</strong>{' '}
          <a href="https://instagram.com/technotitans" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
            @technotitans on Instagram
          </a>
        </p>
      </div>
    </div>
  );
};

export default About;