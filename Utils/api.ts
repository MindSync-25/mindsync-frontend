import axios from 'axios';

// Replace this with your local IP address
const API = axios.create({
  baseURL: 'http://192.168.x.x:5000/api', // ← Your IP
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default API;
