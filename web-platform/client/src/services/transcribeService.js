import api from './api';

export const transcribeAudioFile = async (audioFile) => {
  const formData = new FormData();
  formData.append('audio', audioFile);
  
  const response = await api.post('/api/transcribe/audio', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  
  return response.data;
};