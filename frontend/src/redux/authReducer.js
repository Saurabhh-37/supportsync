const initialState = {
  user: null, // Stores logged-in user
};

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case "SET_USER":
      return { ...state, user: action.payload }; // ✅ Store user
    case "LOGOUT":
      return { ...state, user: null }; // ✅ Clear user
    default:
      return state;
  }
};

export default authReducer;
