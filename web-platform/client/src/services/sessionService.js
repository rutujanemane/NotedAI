import api from './api';

export const getSessions = async () => {
  const response = await api.get('/api/sessions');
  return response.data;
};

export const getSessionById = async (id) => {
  const response = await api.get(`/api/sessions/${id}`);
  return response.data;
};

export const createSession = async (sessionData) => {
  const response = await api.post('/api/sessions', sessionData);
  return response.data;
};

export const updateSession = async (id, sessionData) => {
  const response = await api.put(`/api/sessions/${id}`, sessionData);
  return response.data;
};

export const deleteSession = async (id) => {
  const response = await api.delete(`/api/sessions/${id}`);
  return response.data;
};

export const searchSessions = async (query) => {
  const response = await api.get(`/api/sessions/search?query=${query}`);
  return response.data;
};

export const askQuestion = async (id, question) => {
  const response = await api.post(`/api/sessions/${id}/ask`, { question });
  return response.data;
};