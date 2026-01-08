import api from './api';

export const requestService = {
  submitLeaveRequest: async (formData) => {
    try {
      const response = await api.post('/leave-request/submit', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        transformRequest: (data, headers) => {
            return data;
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
              responseType: 'blob' 
          });
          
          return new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => {
                  resolve(reader.result);
              };
              reader.onerror = (error) => {
                  reject(error);
              };
              reader.readAsDataURL(response.data);
          });
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
