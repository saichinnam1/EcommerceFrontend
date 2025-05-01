import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api, { getOrders, getUserById } from '../services/api';
import '../styles/Profile.css';

const Profile = () => {
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('profile');
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [editingAddress, setEditingAddress] = useState(false);
  
  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    zipCode: ''
  });
  
  const [addressForm, setAddressForm] = useState({ ...shippingAddress });

  useEffect(() => {
    if (!user) {
      toast.error('Please log in to view your profile.');
      navigate('/auth');
      return;
    }

    if (user?.id) {
      const fetchUserData = async () => {
        try {
          const response = await getUserById(user.id);
          const userData = response.data;
          setShippingAddress({
            street: userData.address || '',
            city: userData.city || '',
            zipCode: userData.postalCode || ''
          });
          setAddressForm({
            street: userData.address || '',
            city: userData.city || '',
            zipCode: userData.postalCode || ''
          });
        } catch (error) {
          console.error('Failed to fetch user data:', error.message);
          toast.error(`Failed to load user data: ${error.message}`);
        }
      };

      fetchUserData();

      const fetchOrders = async () => {
        setLoadingOrders(true);
        try {
          const ordersData = await getOrders(user.id);
          setOrders(ordersData || []);
        } catch (error) {
          console.error('Failed to fetch orders:', error.message);
          toast.error(`Failed to load orders: ${error.message}`);
          setOrders([]);
        } finally {
          setLoadingOrders(false);
        }
      };
      fetchOrders();
    }
  }, [user, navigate]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'badge bg-success';
      case 'processing':
        return 'badge bg-warning text-dark';
      case 'shipped':
        return 'badge bg-primary';
      case 'cancelled':
        return 'badge bg-danger';
      default:
        return 'badge bg-secondary';
    }
  };

  const handleViewDetails = (orderId) => {
    navigate(`/order/${orderId}`);
  };

  const handleCancelOrder = async (orderId) => {
    try {
      await api.put(
        `/orders/${orderId}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      toast.success('Order cancelled successfully!');
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: 'Cancelled' } : order
        )
      );
    } catch (error) {
      console.error('Failed to cancel order:', error.response?.data?.message || error.message);
      toast.error('Failed to cancel order. Please try again.');
    }
  };
  
  const handleEditAddress = () => {
    setEditingAddress(true);
    setAddressForm({ ...shippingAddress });
  };

  const handleSaveAddress = async () => {
    try {
      const updatedUser = {
        address: addressForm.street,
        city: addressForm.city,
        postalCode: addressForm.zipCode
      };

      await api.put(`/users/${user.id}`, updatedUser, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      setShippingAddress({ ...addressForm });
      setEditingAddress(false);
      toast.success('Shipping address updated successfully!');
    } catch (error) {
      console.error('Failed to save address:', error.message);
      toast.error(`Failed to save address: ${error.message}`);
    }
  };
  
  const handleCancelEdit = () => {
    setEditingAddress(false);
  };
  
  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddressForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const renderProfileContent = () => {
    if (activeTab === 'profile') {
      return (
        <div className="content-card shadow-sm">
          <div className="card-header bg-white border-bottom d-flex justify-content-between align-items-center">
            <h5 className="mb-0 fw-bold">Profile Information</h5>
          </div>
          <div className="card-body p-4">
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label text-muted small">Username</label>
                <p className="form-control-plaintext fw-medium">{user?.username}</p>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label text-muted small">Email</label>
                <p className="form-control-plaintext fw-medium">{user?.email}</p>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label text-muted small">Member Since</label>
                <p className="form-control-plaintext fw-medium">June 2022</p>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label text-muted small">Role</label>
                <p className="form-control-plaintext">
                  <span className="badge bg-light text-dark border">
                    {user?.roles?.join(', ') || 'User'}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    if (activeTab === 'address') {
      return (
        <div className="content-card shadow-sm">
          <div className="card-header bg-white border-bottom d-flex justify-content-between align-items-center">
            <h5 className="mb-0 fw-bold">Shipping Address</h5>
            {!editingAddress && (
              <button className="btn btn-outline-primary btn-sm" onClick={handleEditAddress}>
                <i className="bi bi-pencil me-2"></i>Edit
              </button>
            )}
          </div>
          <div className="card-body p-4">
            {editingAddress ? (
              <div className="address-form">
                <div className="row mb-3">
                  <div className="col-md-12">
                    <label htmlFor="street" className="form-label">Street Address</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      id="street" 
                      name="street" 
                      value={addressForm.street} 
                      onChange={handleAddressChange}
                    />
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="city" className="form-label">City</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      id="city" 
                      name="city" 
                      value={addressForm.city} 
                      onChange={handleAddressChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="zipCode" className="form-label">ZIP Code</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      id="zipCode" 
                      name="zipCode" 
                      value={addressForm.zipCode} 
                      onChange={handleAddressChange}
                    />
                  </div>
                </div>
                <div className="d-flex justify-content-end mt-4">
                  <button className="btn btn-outline-secondary me-2" onClick={handleCancelEdit}>Cancel</button>
                  <button className="btn btn-primary" onClick={handleSaveAddress}>Save Address</button>
                </div>
              </div>
            ) : (
              <div className="address-display">
                <div className="card border bg-light">
                  <div className="card-body">
                    <div className="d-flex">
                      <div className="address-icon me-3">
                        <i className="bi bi-geo-alt-fill text-primary fs-4"></i>
                      </div>
                      <div className="address-content">
                        <h6 className="fw-bold mb-2">Default Shipping Address</h6>
                        <p className="mb-1">{shippingAddress.street || 'Not set'}</p>
                        <p className="mb-1">
                          {shippingAddress.city || 'Not set'}, {shippingAddress.zipCode || 'Not set'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }
    
    if (activeTab === 'orders') {
      return (
        <div className="content-card shadow-sm">
          <div className="card-header bg-white border-bottom">
            <h5 className="mb-0 fw-bold">Order History</h5>
          </div>
          <div className="card-body p-4">
            {loadingOrders ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3 text-muted">Loading your orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-cart-x text-muted display-4"></i>
                <h5 className="mt-3 fw-bold">No orders yet</h5>
                <p className="text-muted mb-4">You haven't placed any orders yet.</p>
                <button className="btn btn-primary" onClick={() => navigate('/')}>
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Order ID</th>
                      <th>Date</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td><span className="fw-medium">#{order.id}</span></td>
                        <td>{formatDate(order.orderDate)}</td>
                        <td><span className="fw-medium">${order.total.toFixed(2)}</span></td>
                        <td>
                          <span className={getStatusBadgeClass(order.status)}>
                            {order.status}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => handleViewDetails(order.id)}
                            >
                              Details
                            </button>
                            {order.status.toLowerCase() === 'processing' && (
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleCancelOrder(order.id)}
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      );
    }
  };

  return (
    <div className="profile-container container py-5">
      <div className="row g-4">
        {/* Profile Sidebar */}
        <div className="col-lg-3 col-md-4">
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-body p-0">
              <div className="bg-primary text-white p-4 text-center">
                <div className="avatar-circle mx-auto mb-3">
                  <span className="avatar-text display-4">{user?.username?.charAt(0).toUpperCase() || 'U'}</span>
                </div>
                <h5 className="mb-1">{user?.username || 'User'}</h5>
                <p className="mb-2 small opacity-75">{user?.email}</p>
                <span className="badge bg-light text-primary">{user?.roles?.join(', ') || 'User'}</span>
              </div>
              
              <div className="nav flex-column nav-pills p-3">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`nav-link d-flex align-items-center mb-2 ${activeTab === 'profile' ? 'active' : ''}`}
                >
                  <i className="bi bi-person-fill me-3"></i>
                  Profile Information
                </button>
                <button
                  onClick={() => setActiveTab('address')}
                  className={`nav-link d-flex align-items-center mb-2 ${activeTab === 'address' ? 'active' : ''}`}
                >
                  <i className="bi bi-house-door-fill me-3"></i>
                  Shipping Address
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`nav-link d-flex align-items-center position-relative ${activeTab === 'orders' ? 'active' : ''}`}
                >
                  <i className="bi bi-bag-fill me-3"></i>
                  My Orders
                  {orders.length > 0 && (
                    <span className="position-absolute top-50 end-0 translate-middle-y badge rounded-pill bg-danger me-2">
                      {orders.length}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="col-lg-9 col-md-8">
          {renderProfileContent()}
        </div>
      </div>
    </div>
  );
};

export default Profile;