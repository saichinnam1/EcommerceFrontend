import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../styles/Navbar.css';

const Navbar = () => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/auth');
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    document.body.classList.toggle('menu-open', !menuOpen);
  };

  useEffect(() => {
    return () => {
      document.body.classList.remove('menu-open');
    };
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    document.body.classList.remove('menu-open');
  }, [location]);

  return (
    <header className={`navbar-wrapper ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <div className="navbar-left">
          <Link to="/" className="navbar-brand">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="brand-icon">
              <path d="M13 10V3L4 14H11V21L20 10H13Z" fill="currentColor" />
            </svg>
            <span className="brand-text">TECNO TITANS</span>
          </Link>
          
          <nav className="desktop-nav">
            <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>Home</Link>
            <Link to="/about" className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`}>About Us</Link>
            <Link to="/contact" className={`nav-link ${location.pathname === '/contact' ? 'active' : ''}`}>Contact</Link>
          </nav>
        </div>
        
        <div className="navbar-right">
          {isAuthenticated ? (
            <>
              <Link to="/profile" className="nav-action-link">
                <i className="bi bi-person-circle"></i>
                <span>Profile</span>
              </Link>
              <Link to="/cart" className="nav-action-link cart-link">
                <i className="bi bi-bag"></i>
                <span>Cart</span>
              </Link>
              <Link to="/search" className="nav-action-link search-link">
                <i className="bi bi-search"></i>
                <span>Search</span>
              </Link>
              <button className="nav-action-link logout-btn" onClick={handleLogout}>
                <i className="bi bi-box-arrow-right"></i>
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/auth" className="login-btn">
                <i className="bi bi-box-arrow-in-right"></i>
                <span>Login</span>
              </Link>
              <Link to="/search" className="nav-action-link search-link">
                <i className="bi bi-search"></i>
                <span>Search</span>
              </Link>
            </>
          )}
        </div>

        <button className="menu-toggle" onClick={toggleMenu} aria-label="Toggle menu">
          <div className={`hamburger ${menuOpen ? 'active' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </button>
      </div>
      
      <div className={`mobile-menu ${menuOpen ? 'show' : ''}`}>
        <nav className="mobile-nav">
          <Link to="/" className={`mobile-nav-link ${location.pathname === '/' ? 'active' : ''}`}>Home</Link>
          <Link to="/about" className={`mobile-nav-link ${location.pathname === '/about' ? 'active' : ''}`}>About Us</Link>
          <Link to="/contact" className={`mobile-nav-link ${location.pathname === '/contact' ? 'active' : ''}`}>Contact</Link>
          
          {isAuthenticated ? (
            <>
              <Link to="/profile" className="mobile-nav-link">
                <i className="bi bi-person-circle"></i>
                <span>Profile</span>
              </Link>
              <Link to="/cart" className="mobile-nav-link">
                <i className="bi bi-bag"></i>
                <span>Cart</span>
              </Link>
              {/* Removed search link from mobile menu since it's now outside */}
              <button className="mobile-nav-link mobile-logout" onClick={handleLogout}>
                <i className="bi bi-box-arrow-right"></i>
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/auth" className="mobile-nav-link auth-link">
                <i className="bi bi-box-arrow-in-right"></i>
                <span>Login/Signup</span>
              </Link>
              {/* Removed search link from mobile menu since it's now outside */}
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
