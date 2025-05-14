import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { login, register, registerWithGoogle, handleOAuth2Success, createPasswordResetTokenForUser } from '../services/api';
import { Modal, Button } from 'react-bootstrap';
import '../styles/AuthPage.css';

const AuthPage = () => {
  const [activeTab, setActiveTab] = useState('login');
  const [loginCredentials, setLoginCredentials] = useState({
    username: '',
    password: '',
    rememberMe: false
  });
  const [signupCredentials, setSignupCredentials] = useState({
    username: '',
    email: '',
    password: '',
    termsAccepted: false,
  });
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);
  const navigate = useNavigate();

  const handleOAuth2SuccessSubmit = useCallback(async () => {
    try {
      const response = await handleOAuth2Success();
      const { token, refreshToken } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      toast.success('Logged in successfully with Google!');
      setTimeout(() => navigate('/'), 1000);
    } catch (error) {
      console.error('OAuth2 success error:', error.message);
      toast.error(`Failed to log in with Google: ${error.message}`);
    }
  }, [navigate]);

  useEffect(() => {
    if (window.location.pathname === '/auth/success') {
      handleOAuth2SuccessSubmit();
    }
  }, [handleOAuth2SuccessSubmit]);

  const handleLoginInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLoginCredentials((prev) => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSignupInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSignupCredentials((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginCredentials.username || !loginCredentials.password) {
      toast.error('Please fill in all fields.');
      return;
    }
    try {
      const response = await login({ 
        username: loginCredentials.username, 
        password: loginCredentials.password 
      });
      const { token, refreshToken } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      
      if (loginCredentials.rememberMe) {
        localStorage.setItem('rememberedUser', loginCredentials.username);
      } else {
        localStorage.removeItem('rememberedUser');
      }
      
      const user = response.data.user;
      if (user.id) user.id = parseInt(user.id, 10);
      toast.success('Logged in successfully!');
      setTimeout(() => navigate('/'), 1000); 
    } catch (error) {
      console.error('Login error:', error.message);
      if (error.message.includes('timed out')) {
        toast.error('Login request timed out. Please check your internet connection or try again later.');
      } else if (error.message.includes('Unauthorized')) {
        toast.error('Invalid username or password. Please try again.');
      } else {
        toast.error(`Failed to log in: ${error.message}`);
      }
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (!signupCredentials.username || !signupCredentials.email || !signupCredentials.password) {
      toast.error('Please fill in all fields.');
      return;
    }
    if (!signupCredentials.termsAccepted) {
      toast.error('Please accept the terms & conditions.');
      return;
    }
    try {
      const response = await register({
        username: signupCredentials.username,
        email: signupCredentials.email,
        password: signupCredentials.password,
        role: 'USER',
      });
      const { token, refreshToken } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      const user = response.data.user;
      if (user.id) user.id = parseInt(user.id, 10);
      toast.success('Registered successfully! Sign in now');
      setTimeout(() => navigate('/auth'), 2500); 
    } catch (error) {
      console.error('Signup error:', error.message);
      if (error.message.includes('timed out')) {
        toast.error('Signup request timed out. Please check your internet connection or try again later.');
      } else if (error.message.includes('Unauthorized')) {
        toast.error('Unauthorized: Please check your details or try again later.');
      } else {
        toast.error(`Failed to register: ${error.message}`);
      }
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetEmail) {
      toast.error('Please enter your email address.');
      return;
    }
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      await createPasswordResetTokenForUser(resetEmail);
      toast.success('Password reset email sent! Check your inbox.');
      setResetEmail('');
      setShowResetModal(false);
    } catch (error) {
      console.error('Reset password error:', error.message);
      if (error.message.includes('timed out')) {
        toast.error('Reset request timed out. Please check your internet connection or try again later.');
      } else if (error.message.includes('Unauthorized')) {
        toast.error('Unauthorized: Please check your email or try again later.');
      } else {
        toast.error(`Failed to send reset email: ${error.message}`);
      }
    }
  };

  const toggleLoginPasswordVisibility = () => {
    setShowLoginPassword(!showLoginPassword);
  };

  const toggleSignupPasswordVisibility = () => {
    setShowSignupPassword(!showSignupPassword);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-logo">
          <h1>Welcome Back</h1>
          <p>Login to your account or create a new one</p>
        </div>
        
        <div className="auth-tabs">
          <button 
            className={`tab-btn ${activeTab === 'login' ? 'active' : ''}`} 
            onClick={() => setActiveTab('login')}
          >
            Login
          </button>
          <button 
            className={`tab-btn ${activeTab === 'signup' ? 'active' : ''}`} 
            onClick={() => setActiveTab('signup')}
          >
            Sign Up
          </button>
        </div>

        <div className="auth-form-container">
          {activeTab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="auth-form">
              <div className="form-group">
                <label>Username</label>
                <div className="input-icon-wrapper">
                  <i className="input-icon far fa-user"></i>
                  <input
                    type="text"
                    name="username"
                    value={loginCredentials.username}
                    onChange={handleLoginInputChange}
                    className="form-control"
                    placeholder="Enter your Username"
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Password</label>
                <div className="input-icon-wrapper">
                  <i className="input-icon fas fa-lock"></i>
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    name="password"
                    value={loginCredentials.password}
                    onChange={handleLoginInputChange}
                    className="form-control"
                    placeholder="Enter your password"
                    required
                  />
                  <button 
                    type="button" 
                    className="password-toggle" 
                    onClick={toggleLoginPasswordVisibility}
                  >
                    {showLoginPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>
              
              <div className="form-options">
                <div className="form-check remember-me">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    id="rememberCheck"
                    checked={loginCredentials.rememberMe}
                    onChange={handleLoginInputChange}
                    className="form-check-input"
                  />
                  <label className="form-check-label" htmlFor="rememberCheck">
                    Remember me
                  </label>
                </div>
                <a href="#reset" onClick={() => setShowResetModal(true)} className="forgot-password">
                  Forgot Password?
                </a>
              </div>
              
              <button type="submit" className="btn btn-primary login-btn">
                Login
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignupSubmit} className="auth-form">
              <div className="form-group">
                <label>Username</label>
                <div className="input-icon-wrapper">
                  <i className="input-icon far fa-user"></i>
                  <input
                    type="text"
                    name="username"
                    value={signupCredentials.username}
                    onChange={handleSignupInputChange}
                    className="form-control"
                    placeholder="Choose a username"
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Email</label>
                <div className="input-icon-wrapper">
                  <i className="input-icon far fa-envelope"></i>
                  <input
                    type="email"
                    name="email"
                    value={signupCredentials.email}
                    onChange={handleSignupInputChange}
                    className="form-control"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Password</label>
                <div className="input-icon-wrapper">
                  <i className="input-icon fas fa-lock"></i>
                  <input
                    type={showSignupPassword ? "text" : "password"}
                    name="password"
                    value={signupCredentials.password}
                    onChange={handleSignupInputChange}
                    className="form-control"
                    placeholder="Create a password"
                    required
                  />
                  <button 
                    type="button" 
                    className="password-toggle" 
                    onClick={toggleSignupPasswordVisibility}
                  >
                    {showSignupPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>
              <div className="form-check terms-check">
                <input
                  type="checkbox"
                  name="termsAccepted"
                  id="termsCheck"
                  checked={signupCredentials.termsAccepted}
                  onChange={handleSignupInputChange}
                  className="form-check-input"
                  required
                />
                <label className="form-check-label" htmlFor="termsCheck">
                  I accept terms & conditions
                </label>
              </div>
              <button type="submit" className="btn btn-primary signup-btn">
                Sign Up
              </button>
            </form>
          )}
          
          <div className="separator">
            <span>or</span>
          </div>
          
          <button
            type="button"
            className="btn btn-google"
            onClick={registerWithGoogle}
          >
            <span className="google-icon">G</span>
            Continue with Google
          </button>
        </div>
        
        {/* Mobile view signup prompt */}
        <div className="mobile-alt-option">
          {activeTab === 'login' ? (
            <p>Don't have an account? <button onClick={() => setActiveTab('signup')} className="text-btn">Sign Up</button></p>
          ) : (
            <p>Already have an account? <button onClick={() => setActiveTab('login')} className="text-btn">Login</button></p>
          )}
        </div>
      </div>
      
      <Modal 
        show={showResetModal} 
        onHide={() => setShowResetModal(false)} 
        centered
        className="password-reset-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Reset Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="reset-instructions">
            Enter your email address below. We'll send you a link to reset your password.
          </p>
          <form onSubmit={handleResetPassword} className="reset-form">
            <div className="form-group">
              <div className="input-icon-wrapper">
                <i className="input-icon far fa-envelope"></i>
                <input
                  type="email"
                  className="form-control"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>
            <div className="reset-buttons">
              <Button variant="secondary" onClick={() => setShowResetModal(false)} className="cancel-btn">
                Cancel
              </Button>
              <Button variant="primary" type="submit" className="reset-submit-btn">
                Send Reset Link
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default AuthPage;
