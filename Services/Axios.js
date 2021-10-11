const axios = require("axios");

const instance = axios.create({
  baseURL: process.env.RAPID_API_URL,
});

instance.interceptors.request.use(
  (config) => {
    config.headers["x-rapidapi-host"] = process.env.RAPID_API_HOST;
    config.headers["x-rapidapi-key"] = process.env.RAPID_API_KEY;
    return config;
  },
  (error) => {
    Promise.reject(error);
  }
);
module.exports.axiosInstance = instance;
