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

  getRequestsForClass: async (classId, filters = {}) => {
    try {
      const { status = 'all', startDate, endDate } = filters;
      let url = `/leave-request/${classId}`;

      if (status !== 'all') {
        url += `/${status.toLowerCase()}`;
      } else {
        url += '/all';
      }

      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await api.get(url, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching requests:', error.response?.data || error);
      throw error;
    }
  },

  approveRequest: async (requestId) => {
    try {
      const response = await api.post(`/leave-request/${requestId}/approve`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  denyRequest: async (requestId, denialReason) => {
    try {
      const response = await api.post(`/leave-request/${requestId}/deny`, { denialReason });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getLeaveRequestDetail: async (requestId) => {
    try {
      const response = await api.get(`/leave-request/instructor/${requestId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
