import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import ticketReducer from "./ticketSlice";
import featureRequestReducer from "./featureRequestSlice";

// Create Redux store
const store = configureStore({
  reducer: {
    user: userReducer,
    tickets: ticketReducer,
    featureRequests: featureRequestReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Disable serializable check for non-serializable values
    }),
});

export default store;
