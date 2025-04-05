// Background script for NotedAI Chrome Extension

let mediaRecorder;
let audioChunks = [];
let transcript = '';
let recognitionInstance = null;

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'startRecording') {
    startRecording(message.source)
      .then(() => sendResponse({ success: true }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep the message channel open for async response
  }
  
  if (message.action === 'stopRecording') {
    stopRecording()
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep the message channel open for async response
  }
  
  if (message.action === 'getTranscript') {
    sendResponse({ transcript });
    return true;
  }
});

// Function to start recording
async function startRecording(source) {
  // Reset previous recording data
  audioChunks = [];
  transcript = '';
  
  try {
    let stream;
    
    if (source === 'microphone') {
      // Get microphone audio stream
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } else if (source === 'tab') {
      // Get current tab audio stream
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      stream = await chrome.tabCapture.capture({ audio: true, video: false });
    } else {
      throw new Error('Invalid audio source');
    }
    
    // Create media recorder
    mediaRecorder = new MediaRecorder(stream);
    
    // Set up speech recognition
    setupSpeechRecognition();
    
    // Handle data available event
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };
    
    // Start recording
    mediaRecorder.start(1000); // Collect data every second
    
    // Update status
    chrome.storage.local.get(['recordingState'], (data) => {
      const state = data.recordingState || {};
      state.isRecording = true;
      
      chrome.storage.local.set({ recordingState: state });
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error starting recording:', error);
    return { success: false, error: error.message };
  }
}

// Function to stop recording
async function stopRecording() {
  try {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      // Stop media recorder
      mediaRecorder.stop();
      
      // Stop all audio tracks
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
    
    // Stop speech recognition
    if (recognitionInstance) {
      recognitionInstance.stop();
    }
    
    // Clear recording state
    chrome.storage.local.remove(['recordingState']);
    
    return { success: true, transcript };
  } catch (error) {
    console.error('Error stopping recording:', error);
    return { success: false, error: error.message };
  }
}

// Setup Web Speech API for transcription
function setupSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    console.error('Speech recognition not supported in this browser');
    return;
  }
  
  recognitionInstance = new SpeechRecognition();
  recognitionInstance.continuous = true;
  recognitionInstance.interimResults = true;
  recognitionInstance.lang = 'en-US';
  
  recognitionInstance.onresult = (event) => {
    let interimTranscript = '';
    let finalTranscript = '';
    
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      const text = result[0].transcript;
      
      if (result.isFinal) {
        finalTranscript += text;
      } else {
        interimTranscript += text;
      }
    }
    
    // Update transcript
    if (finalTranscript) {
      transcript += finalTranscript + ' ';
      
      // Update storage
      chrome.storage.local.get(['recordingState'], (data) => {
        const state = data.recordingState || {};
        state.transcript = transcript;
        
        chrome.storage.local.set({ recordingState: state });
      });
    }
  };
  
  recognitionInstance.onerror = (event) => {
    console.error('Recognition error:', event.error);
    
    // Restart recognition if it stops due to error
    if (event.error !== 'aborted' && event.error !== 'no-speech') {
      recognitionInstance.stop();
      setTimeout(() => {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
          recognitionInstance.start();
        }
      }, 1000);
    }
  };
  
  recognitionInstance.start();
}

// Handle authentication callback from the main web application
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url.includes('auth/callback?token=')) {
    const url = new URL(tab.url);
    const token = url.searchParams.get('token');
    const userData = url.searchParams.get('user');
    
    if (token && userData) {
      try {
        const user = JSON.parse(atob(userData));
        
        // Store authentication data
        chrome.storage.local.set({
          token,
          user
        }, () => {
          // Close the tab and open extension popup
          chrome.tabs.remove(tabId);
          chrome.action.openPopup();
        });
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }
});
