import { createSlice } from '@reduxjs/toolkit';

const featureRequestSlice = createSlice({
  name: 'featureRequests',
  initialState: {
    requests: [],
    loading: false,
    error: null,
    filters: {
      status: '',
      priority: '',
    },
    searchQuery: '',
  },
  reducers: {
    setFeatureRequests: (state, action) => {
      state.requests = action.payload;
      state.loading = false;
      state.error = null;
    },
    addFeatureRequest: (state, action) => {
      state.requests.push(action.payload);
    },
    updateFeatureRequest: (state, action) => {
      const index = state.requests.findIndex(request => request.id === action.payload.id);
      if (index !== -1) {
        state.requests[index] = action.payload;
      }
    },
    deleteFeatureRequest: (state, action) => {
      state.requests = state.requests.filter(request => request.id !== action.payload);
    },
    upvoteFeatureRequest: (state, action) => {
      const request = state.requests.find(req => req.id === action.payload);
      if (request) {
        request.upvotes = (request.upvotes || 0) + 1;
      }
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
  },
});

export const {
  setFeatureRequests,
  addFeatureRequest,
  updateFeatureRequest,
  deleteFeatureRequest,
  upvoteFeatureRequest,
  setLoading,
  setError,
  setFilters,
  setSearchQuery,
} = featureRequestSlice.actions;

export default featureRequestSlice.reducer; 