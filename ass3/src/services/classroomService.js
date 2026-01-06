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

  getMyTeachingClasses: async () => {
    try {
      const response = await api.get('/classroom/my-teaching');
      return response.data;
    } catch (error) {
      console.error('Error fetching teaching classes:', error);
      throw error;
    }
  },

  getStudentsInClass: async (classId) => {
    try {
      const response = await api.get(`/classroom/${classId}/students`);
      return response.data;
    } catch (error) {
      console.error('Error fetching students:', error);
      throw error;
    }
  },

  createClass: async (id, name, description) => {
    try {
      const response = await api.post('/classroom/create', {
        id,
        name,
        description,
      });
      return response.data;
    } catch (error) {
      console.error('Error creating class:', error.response?.data || error);
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
};
