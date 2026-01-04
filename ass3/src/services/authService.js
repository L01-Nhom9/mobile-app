import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const authService = {
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { accessToken, refreshToken } = response.data;
      
      // Save token temporarily to make the probe request
      await AsyncStorage.setItem('accessToken', accessToken);

      // Probe to determine role
      let role = 'student';
      try {
        // Try to access an instructor-only endpoint
        await api.get('/classroom/my-teaching');
        role = 'instructor';
      } catch (error) {
        // If 403, it means not authorized as instructor, so likely student
        // If other error, default to student or handle appropriately? 
        // For now assume 403 means student.
      }

      const user = {
          email,
          role,
          accessToken,
          refreshToken
      };
      
      return user;
    } catch (error) {
      throw error;
    }
  },

  register: async (email, password, fullName, role) => {
    try {
      // Note: role must be 'STUDENT' or 'INSTRUCTOR' (uppercase) for backend enum
      const response = await api.post('/auth/register', {
        email,
        password,
        fullName,
        role: role.toUpperCase() 
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  logout: async () => {
    try {
      await AsyncStorage.removeItem('accessToken');
    } catch (error) {
      console.error('Error removing token', error);
    }
  }
};
