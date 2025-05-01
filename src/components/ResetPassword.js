import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { resetPassword, validatePasswordResetToken } from '../services/api';
import '../styles/ResetPassword.css';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isValidToken, setIsValidToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');

  useEffect(() => {
    const validateToken = async () => {
      try {
        await validatePasswordResetToken(token);
        setIsValidToken(true);
      } catch (error) {
        setIsValidToken(false);
        toast.error('Invalid or expired token. Please request a new one.');
      }
    };
    validateToken();
  }, [token]);

  const checkPasswordStrength = (password) => {
    if (password.length === 0) return '';
    if (password.length < 6) return 'weak';
    if (password.length < 10) return 'medium';
    return 'strong';
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setNewPassword(value);
    setPasswordStrength(checkPasswordStrength(value));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    
    setIsLoading(true);
    try {
      await resetPassword({ token, newPassword });
      toast.success('Password reset successfully! Please log in.');
      navigate('/auth');
    } catch (error) {
      toast.error(`Failed to reset password: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidToken === null) return (
    <div className="reset-password-page">
      <div className="reset-password-container">
        <div className="loading-spinner"></div>
        <p>Validating your reset link...</p>
      </div>
    </div>
  );
  
  if (isValidToken === false) return (
    <div className="reset-password-page">
      <div className="reset-password-container invalid-token">
        <div className="icon-container">
          <i className="error-icon">!</i>
        </div>
        <h2>Link Expired</h2>
        <p>Invalid or expired reset link. Please request a new one.</p>
        <button onClick={() => navigate('/auth')} className="btn-primary">
          Back to Login
        </button>
      </div>
    </div>
  );

  return (
    <div className="reset-password-page">
      <div className="reset-password-container">
        <div className="form-header">
          <h2>Reset Your Password</h2>
          <p>Please enter a new secure password for your account</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="new-password">New Password</label>
            <div className="password-input-container">
              <input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={handlePasswordChange}
                placeholder="Enter new password"
                required
              />
              {passwordStrength && (
                <div className={`password-strength ${passwordStrength}`}>
                  <span className="strength-indicator"></span>
                  <span className="strength-text">{passwordStrength}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="confirm-password">Confirm Password</label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
            />
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="password-mismatch">Passwords don't match</p>
            )}
          </div>
          
          <button 
            type="submit" 
            className={`btn-primary ${isLoading ? 'loading' : ''}`}
            disabled={isLoading || newPassword !== confirmPassword || !newPassword}
          >
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
        
        <div className="form-footer">
          <p>Remember your password? <span className="link" onClick={() => navigate('/auth')}>Log in</span></p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;