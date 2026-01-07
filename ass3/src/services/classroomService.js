import api from './api';

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
  }
};
