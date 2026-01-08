import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const classroomService = {
  getEnrolledClasses: async () => {
    try {
      const response = await api.get('/classroom/my-enrolled');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  joinClass: async (joinCode) => {
    try {
      console.log('Joining class with code:', joinCode);
      const response = await api.post('/classroom/join', { joinCode });
      return response.data;
    } catch (error) {
      console.log('Join class error:', error.response?.status, error.response?.data);
      throw error;
    }
  },

  leaveClass: async (classId) => {
    try {
      const response = await api.delete(`/classroom/leave/${classId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Instructor APIs
  createClass: async (classData) => {
    try {
      const response = await api.post('/classroom/create', classData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getTeachedClasses: async () => {
    try {
      const response = await api.get('/classroom/my-teaching');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getClassStudents: async (classId) => {
    try {
      const response = await api.get(`/classroom/${classId}/students`);
      return response.data;
    } catch (error) {
       console.log("Error fetching students:", error);
       throw error;
    }
  },

  getAttendanceReport: async (classId, fromDate, toDate) => {
    try {
        // Explicitly get token as requested
        const token = await AsyncStorage.getItem('accessToken');
        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

      const response = await api.get(`/report/${classId}/attendance-report`, {
        params: { from: fromDate, to: toDate },
        headers: headers, // Explicitly pass headers
        responseType: 'text'
      });
      return response.data;
    } catch (error) {
      console.log("getAttendanceReport Error:", error.response?.status, error.response?.data);
      throw error;
    }
  }
};
