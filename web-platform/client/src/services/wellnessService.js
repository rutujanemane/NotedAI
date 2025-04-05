import api from './api';

export const getWellnessTips = async () => {
  const response = await api.get('/api/wellness/tips');
  return response.data;
};