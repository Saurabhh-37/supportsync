import API from "./api";

// Fetch Current User from Backend
export const fetchCurrentUser = async (dispatch) => {
  try {
    const res = await API.get("/api/auth/profile");
    dispatch({ type: "SET_USER", payload: res.data }); // ✅ Store user in Redux
  } catch (err) {
    console.error("Failed to fetch user", err);
    dispatch({ type: "SET_USER", payload: null }); // ✅ Clear user if not authenticated
  }
};

// Logout User
export const logoutUser = async (dispatch) => {
  try {
    await API.post("/api/auth/logout");
    dispatch({ type: "LOGOUT" }); // ✅ Clear user state
  } catch (err) {
    console.error("Logout failed", err);
  }
};
