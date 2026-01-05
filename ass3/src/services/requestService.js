import api from './api';

export const requestService = {
  submitLeaveRequest: async (formData) => {
    try {
      const response = await api.post('/leave-request/submit', formData, {
        transformRequest: (data, headers) => {
            return data; // formatted form data
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getMyRequests: async () => {
    try {
      const response = await api.get('/leave-request/my-requests');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
