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

  getRequestEvidence: async (requestId) => {
      try {
          const response = await api.get(`/leave-request/evidence/${requestId}`, {
              responseType: 'arraybuffer' // Important for images
          });
          // Convert to base64
          const base64 = Buffer.from(response.data, 'binary').toString('base64');
          
          // Determine mime type if possible, or default to png/jpeg logic
          // The API might return content-type header
          const contentType = response.headers['content-type'] || 'image/jpeg';
          return `data:${contentType};base64,${base64}`;
      } catch (error) {
          throw error;
      }
  },

  deleteRequest: async (requestId) => {
      try {
          const response = await api.delete(`/leave-request/${requestId}`);
          return response.data;
      } catch (error) {
          throw error;
      }
  },

  getRequestsByClass: async (classId) => {
    try {
        const response = await api.get(`/leave-request/classroom/${classId}`);
        return response.data;
    } catch (error) {
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

  rejectRequest: async (requestId, denialReason) => {
      try {
          const response = await api.post(`/leave-request/${requestId}/deny`, {
              denialReason: denialReason
          });
          return response.data;
      } catch (error) {
          throw error;
      }
  },

  getAllRequests: async () => {
    try {
        const response = await api.get('/leave-request/my-all');
        return response.data;
    } catch (error) {
        throw error;
    }
  }
};
