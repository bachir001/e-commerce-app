import axios from "axios";

export default axios.create({
  baseURL: process.env.EXPO_PUBLIC_BACKEND_BASE_URL,
  withCredentials: true,
  validateStatus: (status) => {
    return true;
  },
});
