import axios from "axios";

export default axios.create({
  baseURL: `https://testapi.gocami.com/api/`,
  withCredentials: true,
  validateStatus: (status) => {
    return true;
  },
});
