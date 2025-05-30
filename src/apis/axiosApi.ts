import axios from "axios";

export default axios.create({
  baseURL: `https://api-gocami-test.gocami.com/api/`,
  withCredentials: true,
  validateStatus: (status) => {
    return true;
  },
});
