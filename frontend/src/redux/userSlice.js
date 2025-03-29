import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.error = null;
    },
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.isAuthenticated = false;
    },
  },
});

export const { setUser, clearUser, setLoading, setError } = userSlice.actions;

// Selectors
export const selectCurrentUser = (state) => state.user.user;
export const selectIsAuthenticated = (state) => state.user.isAuthenticated;
export const selectLoading = (state) => state.user.loading;
export const selectError = (state) => state.user.error;

// Role-based selectors
export const selectUserRole = (state) => state.user.user?.role || null;
export const selectIsAgent = (state) => ['agent', 'admin'].includes(state.user.user?.role);
export const selectIsAdmin = (state) => state.user.user?.role === 'admin';

export default userSlice.reducer; 