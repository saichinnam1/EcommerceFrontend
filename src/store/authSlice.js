import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const validateToken = createAsyncThunk(
  'auth/validateToken',
  async ({ navigate, locationPath }, { dispatch, rejectWithValue }) => {
    const token = localStorage.getItem('token');
    if (!token) {
      return rejectWithValue({ user: null, isAuthenticated: false, error: 'No token found' });
    }

    try {
      const response = await api.get('/auth/validate');
      const userData = response.data.user;
      if (userData.id) userData.id = parseInt(userData.id, 10);
      if (process.env.NODE_ENV === 'development') {
        console.log('Token validated:', userData);
      }
      return { user: userData, isAuthenticated: true };
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Token validation failed:', error.response?.data?.message || error.message);
      }
      if (error.response?.status === 401) {
        dispatch(logout());
        if (!locationPath.includes('/auth')) {
          navigate('/auth', { replace: true });
        }
      }
      return rejectWithValue({
        user: null,
        isAuthenticated: false,
        error: error.response?.data?.message || 'Validation failed',
      });
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    isAuthenticated: false,
    user: null,
    loading: true,
    oauthLoading: false,
    error: null,
  },
  reducers: {
    setAuth: (state, action) => {
      state.isAuthenticated = true;
      state.user = action.payload;
      state.loading = false;
      state.oauthLoading = false;
      state.error = null;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.loading = false;
      state.oauthLoading = false;
      state.error = null;
      localStorage.removeItem('token');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(validateToken.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(validateToken.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = action.payload.isAuthenticated;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(validateToken.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload?.error || 'Validation failed';
      });
  },
});

export const { setAuth, logout } = authSlice.actions;
export default authSlice.reducer;