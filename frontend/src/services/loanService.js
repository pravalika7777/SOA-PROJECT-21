import api from './api';

export const loanService = {
  createLoan: async (loanData) => {
    const response = await api.post('/loans', loanData);
    return response.data;
  },

  getAllLoans: async () => {
    const response = await api.get('/loans');
    return response.data;
  },

  getLoanById: async (id) => {
    const response = await api.get(`/loans/${id}`);
    return response.data;
  },

  getUserLoans: async (userId) => {
    const response = await api.get(`/loans/user/${userId}`);
    return response.data;
  },

  getLoansByBook: async (bookId) => {
    const response = await api.get(`/loans/book/${bookId}`);
    return response.data;
  },

  getOverdueLoans: async () => {
    const response = await api.get('/loans/overdue');
    return response.data;
  },

  returnLoan: async (id) => {
    const response = await api.put(`/loans/${id}/return`);
    return response.data;
  },

  deleteLoan: async (id) => {
    const response = await api.delete(`/loans/${id}`);
    return typeof response.data === 'string' ? response.data : 'Loan deleted successfully';
  },

  triggerOverdueNotifications: async () => {
    const response = await api.post('/loans/overdue/notify');
    return response.data;
  },
};
