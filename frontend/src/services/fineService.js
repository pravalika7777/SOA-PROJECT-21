import api from './api';

export const fineService = {
  getFines: async () => {
    const response = await api.get('/fines');
    return response.data;
  },

  getFineById: async (id) => {
    const response = await api.get(`/fines/${id}`);
    return response.data;
  },

  getFinesByRental: async (rentalId) => {
    const response = await api.get(`/fines/rental/${rentalId}`);
    return response.data;
  },

  payFine: async (id) => {
    const response = await api.put(`/fines/${id}/pay`);
    return response.data;
  },

  calculateFine: async (data) => {
    const response = await api.post('/fines/calculate', data);
    return response.data;
  },
};
