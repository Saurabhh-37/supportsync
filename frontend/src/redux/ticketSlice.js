import { createSlice } from '@reduxjs/toolkit';

const ticketSlice = createSlice({
  name: 'tickets',
  initialState: {
    tickets: [],
    loading: false,
    error: null,
    filters: {
      status: null,
      priority: null,
      assignedUser: null,
    },
    searchQuery: '',
  },
  reducers: {
    setTickets: (state, action) => {
      state.tickets = action.payload;
      state.loading = false;
      state.error = null;
    },
    addTicket: (state, action) => {
      state.tickets.push(action.payload);
    },
    updateTicket: (state, action) => {
      const index = state.tickets.findIndex(ticket => ticket.id === action.payload.id);
      if (index !== -1) {
        state.tickets[index] = action.payload;
      }
    },
    deleteTicket: (state, action) => {
      state.tickets = state.tickets.filter(ticket => ticket.id !== action.payload);
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
  setTickets,
  addTicket,
  updateTicket,
  deleteTicket,
  setLoading,
  setError,
  setFilters,
  setSearchQuery,
} = ticketSlice.actions;

export default ticketSlice.reducer; 