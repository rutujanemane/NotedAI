import React, { useState, useRef, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const AudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [summary, setSummary] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);
  const [sessionTitle, setSessionTitle] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [stressMarked, setStressMarked] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      // Reset states
      setAudioBlob(null);
      setTranscript('');
      setSummary('');
      audioChunksRef.current = [];
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create media recorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      // Set up event handlers
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        // Combine audio chunks into a single blob
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
        setAudioBlob(audioBlob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        
        // Clear timer
        clearInterval(timerRef.current);
      };
      
      // Start recording
      mediaRecorder.start(100);
      setIsRecording(true);
      
      // Start timer
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      // Default session title
      setSessionTitle(`Recording - ${new Date().toLocaleString()}`);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      setError('Could not access microphone. Please ensure you have granted permission.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const transcribeAudio = async () => {
    if (!audioBlob) {
      setError('No recording available to transcribe');
      return;
    }
    
    try {
      setProcessing(true);
      
      // Create form data with audio blob
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.mp3');
      
      // Call transcription API
      const response = await api.post('/api/transcribe/audio', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Update state with response
      setTranscript(response.data.transcript);
      setSummary(response.data.summary);
      setProcessing(false);
    } catch (error) {
      console.error('Transcription error:', error);
      setError('Failed to transcribe audio. Please try again.');
      setProcessing(false);
    }
  };

  const saveSession = async () => {
    if (!transcript) {
      setError('No transcript available to save');
      return;
    }
    
    try {
      setProcessing(true);
      
      // Create session data
      const sessionData = {
        title: sessionTitle,
        transcript,
        summary,
        isPrivate,
        stressMarked,
        duration: recordingTime
      };
      
      // Save session
      const response = await api.post('/api/sessions', sessionData);
      
      // Navigate to the new session
      navigate(`/sessions/${response.data._id}`);
    } catch (error) {
      console.error('Save session error:', error);
      setError('Failed to save session. Please try again.');
      setProcessing(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Live Recording</h2>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          <p>{error}</p>
        </div>
      )}
      
      {!isRecording && !audioBlob && (
        <div className="text-center py-8">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
          <p className="text-gray-600 mb-4">Start recording to capture audio from your microphone</p>
          <button
            onClick={startRecording}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md font-medium"
          >
            Start Recording
          </button>
        </div>
      )}
      
      {isRecording && (
        <div className="mb-6">
          <div className="flex items-center justify-between bg-red-50 p-4 rounded-md mb-4">
            <div className="flex items-center">
              <div className="animate-pulse h-3 w-3 bg-red-600 rounded-full mr-2"></div>
              <span className="font-medium">Recording</span>
              <span className="ml-2 text-gray-600">{formatTime(recordingTime)}</span>
            </div>
          </div>
          
          <button
            onClick={stopRecording}
            className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium"
          >
            Stop Recording
          </button>
        </div>
      )}
      
      {audioBlob && !transcript && (
        <div className="mb-6">
          <div className="mb-4">
            <p className="text-gray-700 mb-2">Recording complete! ({formatTime(recordingTime)})</p>
            <audio className="w-full" controls src={URL.createObjectURL(audioBlob)}></audio>
          </div>
          
          <button
            onClick={transcribeAudio}
            disabled={processing}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md font-medium disabled:bg-gray-400"
          >
            {processing ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Transcribing...
              </span>
            ) : "Transcribe Recording"}
          </button>
        </div>
      )}
      
      {transcript && (
        <div className="mb-6">
          <div className="mb-4">
            <h3 className="font-medium text-gray-900 mb-2">Session Information</h3>
            <div className="mb-4">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Session Title</label>
              <input
                type="text"
                id="title"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                value={sessionTitle}
                onChange={(e) => setSessionTitle(e.target.value)}
              />
            </div>
            
            <div className="flex flex-col space-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPrivate"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="isPrivate" className="ml-2 block text-sm text-gray-700">
                  Private Session (Secure with Midnight)
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="stressMarked"
                  checked={stressMarked}
                  onChange={(e) => setStressMarked(e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="stressMarked" className="ml-2 block text-sm text-gray-700">
                  Mark as Stressful (for wellness tracking)
                </label>
              </div>
            </div>
          </div>
          
          <div className="mb-4">
            <h3 className="font-medium text-gray-900 mb-2">Transcript</h3>
            <div className="bg-gray-50 p-3 rounded-md max-h-40 overflow-y-auto">
              <p className="text-sm text-gray-700 whitespace-pre-line">{transcript}</p>
            </div>
          </div>
          
          <div className="mb-4">
            <h3 className="font-medium text-gray-900 mb-2">Summary</h3>
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-700 whitespace-pre-line">{summary}</p>
            </div>
          </div>
          
          <button
            onClick={saveSession}
            disabled={processing}
            className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium disabled:bg-gray-400"
          >
            {processing ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : "Save Session"}
          </button>
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;