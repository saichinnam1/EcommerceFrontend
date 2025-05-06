import axios from 'axios';
import { API_URL, BASE_URL } from '../Config/constants'; // Adjust the path based on your file structure

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const fullUrl = `${API_URL}${config.url}`.toLowerCase();
    const isAuthRequest = fullUrl.includes('/auth/login') || 
                          fullUrl.includes('/auth/register') || 
                          fullUrl.includes('/auth/oauth2/success') || 
                          fullUrl.includes('/reset-password');
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API] Full URL: ${fullUrl}, isAuthRequest: ${isAuthRequest}`);
    }
    if (token && !isAuthRequest) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API] ${config.method.toUpperCase()} ${config.url}`, {
        headers: config.headers,
        data: config.data,
      });
    }
    return config;
  },
  (error) => {
    console.error('[API] Request error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    if (response.status === 204) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[API] Response ${response.status} ${response.config.url}, 'No Content'`);
      }
      return response;
    }
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API] Response ${response.status} ${response.config.url}`, response.data);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const fullUrl = `${API_URL}${originalRequest.url}`.toLowerCase();
    const isAuthRequest = fullUrl.includes('/auth/login') || 
                         fullUrl.includes('/auth/register') || 
                         fullUrl.includes('/auth/oauth2/success') || 
                         fullUrl.includes('/reset-password');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRequest) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[API] 401 Unauthorized - Attempting token refresh', {
          url: originalRequest.url,
          data: error.response.data,
        });
      }
      originalRequest._retry = true;
      try {
        const refreshResponse = await axios.post(
          `${API_URL}/auth/refresh`,
          { refreshToken: localStorage.getItem('refreshToken') },
          { withCredentials: true }
        );
        const { token, refreshToken } = refreshResponse.data;
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', refreshToken);
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error('[API] Token refresh failed:', refreshError);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/auth';
        return Promise.reject(refreshError);
      }
    }

    if (error.response?.status === 500 && originalRequest.url.includes('/orders/create-payment-intent') && !originalRequest._retry) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[API] 500 Error on payment intent - Retrying once', {
          url: originalRequest.url,
          data: error.response.data,
        });
      }
      originalRequest._retry = true;
      return api(originalRequest);
    }

    let errorMessage;
    if (error.code === 'ECONNABORTED') {
      errorMessage = 'Request timed out. Please check your internet connection or try again later.';
    } else if (error.response?.status === 401) {
      errorMessage = 'Unauthorized: Please check your credentials or try again later.';
    } else if (error.response?.data?.error) {
      errorMessage = error.response.data.error;
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.response?.data && typeof error.response.data === 'object') {
      errorMessage = Object.values(error.response.data).join(', ');
    } else {
      errorMessage = error.message || 'Unknown error';
    }
    console.error('[API] Response error:', {
      url: error.response?.config.url,
      status: error.response?.status,
      message: errorMessage,
      responseData: error.response?.data,
    });
    return Promise.reject(new Error(errorMessage));
  }
);

// Utility function to validate/fix S3 image URLs
export const fixImageUrl = (url) => {
  if (!url || typeof url !== 'string') return '/placeholder.jpg';
  
  // Check if the URL is already in the correct format
  if (url.includes('s3.eu-north-1.amazonaws.com')) return url;
  
  // Check if it's an S3 URL but missing the region
  if (url.includes('technotitans-product-images.s3.amazonaws.com')) {
    return url.replace('s3.amazonaws.com', 's3.eu-north-1.amazonaws.com');
  }
  
  // If it's not an S3 URL or is invalid, return the placeholder
  return url || '/placeholder.jpg';
};

// Authentication
export const login = (credentials) => {
  if (!credentials?.username || !credentials?.password) {
    throw new Error('Username and password are required');
  }
  return api.post('/auth/login', credentials, { withCredentials: false });
};

export const register = (userData) => {
  if (!userData?.username || !userData?.password || !userData?.email) {
    throw new Error('Username, password, and email are required');
  }
  return api.post('/auth/register', userData, { withCredentials: false });
};

export const registerWithGoogle = () => {
  window.location.href = `${BASE_URL}/oauth2/authorization/google`;
};

export const handleOAuth2Success = () => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  const refreshToken = params.get('refreshToken');

  if (token && refreshToken) {
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    window.history.replaceState({}, document.title, window.location.pathname);
    return Promise.resolve({ data: { token, refreshToken } });
  } else {
    return api.post('/auth/oauth2/success');
  }
};

// Products
export const getProductById = async (id) => {
  if (!id) throw new Error('Product ID is required');
  const response = await api.get(`/products/${id}`);
  // Fix image URL in the response
  if (response.data && response.data.imageUrl) {
    response.data.imageUrl = fixImageUrl(response.data.imageUrl);
  }
  return response;
};

export const getProducts = async () => {
  const response = await api.get('/products');
  // Fix image URLs in the response
  if (response.data && Array.isArray(response.data)) {
    response.data = response.data.map(product => ({
      ...product,
      imageUrl: fixImageUrl(product.imageUrl),
    }));
  }
  return response;
};

export const searchProducts = async (query) => {
  if (!query) throw new Error('Search query is required');
  const response = await api.get(`/products/search?query=${encodeURIComponent(query)}`);
  // Fix image URLs in the response
  if (response.data && Array.isArray(response.data)) {
    response.data = response.data.map(product => ({
      ...product,
      imageUrl: fixImageUrl(product.imageUrl),
    }));
  }
  return response;
};

export const addProduct = (formData) => {
  if (!(formData instanceof FormData)) throw new Error('FormData is required');
  return api.post('/products/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const getProductsByCategory = async (category) => {
  if (!category) throw new Error('Category is required');
  const response = await api.get(`/products/category/${category}`);
  // Fix image URLs in the response
  if (response.data && Array.isArray(response.data)) {
    response.data = response.data.map(product => ({
      ...product,
      imageUrl: fixImageUrl(product.imageUrl),
    }));
  }
  return response;
};

// Cart
export const addToCart = (cartItem) => {
  if (!cartItem?.userId || !cartItem?.productId || !cartItem?.quantity) {
    throw new Error('User ID, product ID, and quantity are required');
  }
  return api.post('/cart/add', cartItem);
};

export const updateCart = (cartItem) => {
  if (!cartItem?.userId || !cartItem?.itemId || cartItem.quantity === undefined) {
    throw new Error('User ID, Item ID, and quantity are required');
  }
  if (isNaN(cartItem.userId) || isNaN(cartItem.itemId) || isNaN(cartItem.quantity)) {
    throw new Error('User ID, Item ID, and quantity must be valid numbers');
  }
  if (cartItem.quantity < 0) {
    throw new Error('Quantity cannot be negative');
  }
  const payload = {
    userId: Number(cartItem.userId),
    itemId: Number(cartItem.itemId),
    quantity: Math.floor(Number(cartItem.quantity)),
  };
  return api.put('/cart/update', payload);
};

export const removeFromCart = (itemId, userId) => {
  if (!itemId || !userId) throw new Error('Item ID and user ID are required');
  return api.delete(`/cart/remove/${itemId}?userId=${userId}`);
};

export const getCart = async (userId) => {
  if (!userId) throw new Error('User ID is required');
  const response = await api.get(`/cart/${userId}`);
  // Fix image URLs in the cart items
  if (response.data && response.data.items && Array.isArray(response.data.items)) {
    response.data.items = response.data.items.map(item => ({
      ...item,
      product: item.product ? {
        ...item.product,
        imageUrl: fixImageUrl(item.product.imageUrl),
      } : item.product,
    }));
  }
  return response;
};

// Orders and Payments
export const createPaymentIntent = (data) => {
  if (!data?.amount || !data?.currency || !data?.userId) {
    throw new Error('Amount, currency, and user ID are required');
  }
  return api.post('/orders/create-payment-intent', data);
};

export const checkout = (request) => {
  if (!request?.userId || !request?.cartItems || !request?.paymentIntentId) {
    throw new Error('User ID, cart items, and payment intent ID are required');
  }
  return api.post('/orders/checkout', request);
};

export const getOrders = async (userId) => {
  if (!userId) throw new Error('User ID is required');
  const parsedUserId = parseInt(userId, 10);
  if (isNaN(parsedUserId)) throw new Error('User ID must be a valid integer');
  const response = await api.get(`/orders/orders/${parsedUserId}`);
  // Fix image URLs in the order items
  if (response.data && Array.isArray(response.data)) {
    response.data = response.data.map(order => ({
      ...order,
      items: order.items && Array.isArray(order.items) ? order.items.map(item => ({
        ...item,
        product: item.product ? {
          ...item.product,
          imageUrl: fixImageUrl(item.product.imageUrl),
        } : item.product,
      })) : order.items,
    }));
  }
  return response.data;
};

export const cancelOrder = (orderId) => {
  if (!orderId) throw new Error('Order ID is required');
  const parsedOrderId = parseInt(orderId, 10);
  if (isNaN(parsedOrderId)) throw new Error('Order ID must be a valid integer');
  return api.put(`/orders/${parsedOrderId}/cancel`).then((response) => response.data);
};

// Users
export const getUserById = (userId) => {
  if (!userId) throw new Error('User ID is required');
  return api.get(`/users/${userId}`);
};

export const getUsers = () => {
  return api.get('/auth/admin/users');
};

// Password Reset Functions
export const createPasswordResetTokenForUser = (email) => {
  if (!email) throw new Error('Email is required');
  return api.post('/reset-password', { email });
};

export const validatePasswordResetToken = (token) => {
  if (!token) throw new Error('Token is required');
  return api.get(`/reset-password/validate/${token}`);
};

export const resetPassword = (data) => {
  if (!data?.token || !data?.newPassword) throw new Error('Token and new password are required');
  return api.post('/reset-password/reset', data);
};

export default api;