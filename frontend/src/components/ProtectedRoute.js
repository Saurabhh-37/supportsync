import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const userId = localStorage.getItem("user"); // ✅ Get userId from localStorage

  return userId ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
