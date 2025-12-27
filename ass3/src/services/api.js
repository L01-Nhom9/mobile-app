import axios from 'axios';
import { Platform } from 'react-native';

// For Android Emulator use 10.0.2.2. For Physical Device use your machine's IP.
// const BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api';
// Replace with your actual local IP if testing on device!
const BASE_URL = 'http://10.0.2.2:5000/api'; 

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
