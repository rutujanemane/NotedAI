import api from './api';

export const getWellnessTips = async () => {
  const response = await api.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/wellness/tips`);
  return response.data;
};