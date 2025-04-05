import React, { useState, useEffect } from 'react';
import { render } from 'react-dom';
import './styles.css';

const Popup = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedSource, setSelectedSource] = useState('microphone');
  const [transcript, setTranscript] = useState('');
  const [summary, setSummary] = useState('');
  const [sessionTitle, setSessionTitle] = useState('');
  const [sessionDuration, setSessionDuration] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user is logged in
    chrome.storage.local.get(['token', 'user'], (result) => {
      if (result.token && result.user) {
        setIsLoggedIn(true);
        setUser(result.user);
      }
      
      // Check if a recording session is in progress
      chrome.storage.local.get(['recordingState'], (data) => {
        if (data.recordingState) {
          const { isRecording, source, transcript, startTime, title } = data.recordingState;
          setIsRecording(isRecording);
          setSelectedSource(source);
          setTranscript(transcript || '');
          setSessionTitle(title || '');
          
          if (startTime) {
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            setSessionDuration(elapsed);
            
            // Update duration every second
            const intervalId = setInterval(() => {
              setSessionDuration(prev => prev + 1);
            }, 1000);
            
            return () => clearInterval(intervalId);
          }
        }
      });
      
      setLoading(false);
    });
  }, []);

  const login = () => {
    // Redirect to NotedAI web app for login
    chrome.tabs.create({ url: `${process.env.API_URL}/api/auth/google` });
  };

  const logout = () => {
    chrome.storage.local.remove(['token', 'user'], () => {
      setIsLoggedIn(false);
      setUser(null);
    });
  };

  const startRecording = () => {
    // Request permission for audio capture if needed
    if (selectedSource === 'microphone') {
      chrome.permissions.request({
        permissions: ['audioCapture']
      }, (granted) => {
        if (granted) {
          initiateRecording();
        } else {
          setError('Microphone permission is required for recording');
        }
      });
    } else {
      initiateRecording();
    }
  };

  const initiateRecording = () => {
    const recordingState = {
      isRecording: true,
      source: selectedSource,
      transcript: '',
      startTime: Date.now(),
      title: sessionTitle || `Session - ${new Date().toLocaleString()}`
    };
    
    chrome.storage.local.set({ recordingState }, () => {
      // Send message to background script to start recording
      chrome.runtime.sendMessage({
        action: 'startRecording',
        source: selectedSource
      });
      
      setIsRecording(true);
      setTranscript('');
      setSummary('');
      setSessionDuration(0);
      
      // Start timer
      const intervalId = setInterval(() => {
        setSessionDuration(prev => prev + 1);
      }, 1000);
      
      return () => clearInterval(intervalId);
    });
  };

  const stopRecording = () => {
    // Send message to background script to stop recording
    chrome.runtime.sendMessage({
      action: 'stopRecording'
    }, (response) => {
      if (response && response.transcript) {
        // Update transcript from final result
        setTranscript(response.transcript);
        
        // Generate summary
        generateSummary(response.transcript);
        
        // Clear recording state
        chrome.storage.local.remove(['recordingState']);
        
        setIsRecording(false);
      }
    });
  };

  const generateSummary = async (text) => {
    try {
      // Call Gemini API for summarization
      const response = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': process.env.GEMINI_API_KEY
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Summarize the following transcript into bullet points, capturing the key information:\n\n${text}`
              }]
            }]
          })
        }
      );
      
      const data = await response.json();
      const summary = data.candidates[0].content.parts[0].text;
      setSummary(summary);
      
    } catch (error) {
      console.error('Error generating summary:', error);
      setError('Failed to generate summary');
    }
  };

  const saveSession = async () => {
    if (!transcript) {
      setError('No transcript available to save');
      return;
    }
    
    try {
      const token = await chrome.storage.local.get(['token']);
      
      if (!token) {
        setError('You must be logged in to save sessions');
        return;
      }
      
      const response = await fetch(`${process.env.API_URL}/api/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token.token
        },
        body: JSON.stringify({
          title: sessionTitle || `Session - ${new Date().toLocaleString()}`,
          transcript,
          summary,
          duration: sessionDuration
        })
      });
      
      if (response.ok) {
        // Clear current session
        setTranscript('');
        setSummary('');
        setSessionTitle('');
        setSessionDuration(0);
        
        // Show success message
        setError('');
        alert('Session saved successfully!');
      } else {
        throw new Error('Failed to save session');
      }
      
    } catch (error) {
      console.error('Error saving session:', error);
      setError('Failed to save session');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold text-primary-600">NotedAI</h1>
        {isLoggedIn ? (
          <div className="flex items-center">
            <span className="text-sm text-gray-600 mr-2">{user.name}</span>
            <button 
              onClick={logout}
              className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
            >
              Logout
            </button>
          </div>
        ) : (
          <button 
            onClick={login}
            className="bg-primary-600 hover:bg-primary-700 text-white px-3 py-1 rounded text-sm"
          >
            Login
          </button>
        )}
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
          {error}
        </div>
      )}
      
      {!isRecording ? (
        <div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recording Source
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              disabled={isRecording}
            >
              <option value="microphone">Microphone</option>
              <option value="tab">Current Tab Audio</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Session Title (Optional)
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter session title"
              value={sessionTitle}
              onChange={(e) => setSessionTitle(e.target.value)}
              disabled={isRecording}
            />
          </div>
          
          <button
            onClick={startRecording}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-md font-medium"
          >
            Start Recording
          </button>
          
          {transcript && (
            <div className="mt-4">
              <h3 className="font-medium text-gray-900 mb-1">Previous Session</h3>
              <div className="bg-white border border-gray-300 rounded-md p-3 mb-3 text-sm text-gray-700 max-h-24 overflow-y-auto">
                {transcript.substring(0, 200)}...
              </div>
              
              <button
                onClick={saveSession}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-md font-medium"
                disabled={!isLoggedIn}
              >
                Save Session
              </button>
              
              {!isLoggedIn && (
                <p className="text-xs text-gray-500 mt-1 text-center">
                  Please login to save sessions
                </p>
              )}
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="bg-red-100 text-red-800 p-3 rounded-md flex justify-between items-center mb-4">
            <div>
              <span className="font-medium">Recording</span>
              <span className="ml-2">{formatTime(sessionDuration)}</span>
            </div>
            <div className="animate-pulse h-3 w-3 bg-red-600 rounded-full"></div>
          </div>
          
          <div className="mb-4">
            <h3 className="font-medium text-gray-900 mb-1">Live Transcript</h3>
            <div className="bg-white border border-gray-300 rounded-md p-3 h-36 overflow-y-auto text-sm text-gray-700">
              {transcript || "Transcript will appear here..."}
            </div>
          </div>
          
          <button
            onClick={stopRecording}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-md font-medium"
          >
            Stop Recording
          </button>
        </div>
      )}
      
      <div className="mt-4 pt-3 border-t border-gray-200">
        <a 
          href={`${process.env.API_URL}`}
          target="_blank"
          className="text-primary-600 hover:text-primary-800 text-sm flex justify-center"
        >
          Open NotedAI Web App
        </a>
      </div>
    </div>
  );
};

render(<Popup />, document.getElementById('app'));
