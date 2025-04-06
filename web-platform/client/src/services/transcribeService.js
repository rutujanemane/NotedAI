import api from './api';

export const transcribeAudioFile = async (audioFile) => {
  const formData = new FormData();
  formData.append('audio', audioFile);
  
  const response = await api.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/transcribe/audio`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  
  return response.data;
};