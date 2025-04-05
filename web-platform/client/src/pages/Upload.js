import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpTrayIcon, DocumentTextIcon, XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { transcribeAudioFile } from '../services/transcribeService';
import { createSession } from '../services/sessionService';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [stressMarked, setStressMarked] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [summary, setSummary] = useState('');
  const [processing, setProcessing] = useState(false);
  const [transcribed, setTranscribed] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef();
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Check file type
      const fileType = selectedFile.type;
      if (!fileType.startsWith('audio/')) {
        toast.error('Please upload an audio file');
        return;
      }
      
      // Check file size (limit to 20MB)
      if (selectedFile.size > 20 * 1024 * 1024) {
        toast.error('File size exceeds 20MB limit');
        return;
      }
      
      setFile(selectedFile);
      
      // Auto-generate title from filename
      const fileName = selectedFile.name.replace(/\.[^/.]+$/, ""); // Remove extension
      setTitle(fileName);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      
      // Check file type
      const fileType = droppedFile.type;
      if (!fileType.startsWith('audio/')) {
        toast.error('Please upload an audio file');
        return;
      }
      
      // Check file size (limit to 20MB)
      if (droppedFile.size > 20 * 1024 * 1024) {
        toast.error('File size exceeds 20MB limit');
        return;
      }
      
      setFile(droppedFile);
      
      // Auto-generate title from filename
      const fileName = droppedFile.name.replace(/\.[^/.]+$/, ""); // Remove extension
      setTitle(fileName);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleRemoveFile = () => {
    setFile(null);
    setTranscript('');
    setSummary('');
    setTranscribed(false);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleTranscribe = async () => {
    if (!file) {
      toast.error('Please upload an audio file');
      return;
    }

    try {
      setProcessing(true);
      
      const result = await transcribeAudioFile(file);
      
      setTranscript(result.transcript);
      setSummary(result.summary);
      setTranscribed(true);
      toast.success('Audio transcribed successfully');
    } catch (error) {
      console.error('Transcription error:', error);
      toast.error('Failed to transcribe audio');
    } finally {
      setProcessing(false);
    }
  };

  const handleSaveSession = async () => {
    if (!title.trim()) {
      toast.error('Please enter a title for the session');
      return;
    }

    try {
      setSaving(true);
      
      // Determine duration if available
      let duration = 0;
      if (file && file.duration) {
        duration = Math.round(file.duration);
      }
      
      const sessionData = {
        title,
        transcript,
        summary,
        isPrivate,
        stressMarked,
        duration
      };
      
      const newSession = await createSession(sessionData);
      
      toast.success('Session saved successfully');
      navigate(`/sessions/${newSession._id}`);
    } catch (error) {
      console.error('Save session error:', error);
      toast.error('Failed to save session');
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Audio</h1>
        <p className="text-gray-600">
          Upload an audio file to get it transcribed and summarized
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          {/* Upload Section */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Audio File</h2>
              
              {file ? (
                <div className="mb-6">
                  <div className="flex items-center justify-between bg-gray-50 p-4 rounded-md">
                    <div className="flex items-center">
                      <DocumentTextIcon className="h-8 w-8 text-primary-600 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">{file.name}</p>
                        <p className="text-sm text-gray-500">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleRemoveFile}
                      className="text-red-600 hover:text-red-800"
                      title="Remove file"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-md p-12 text-center mb-6"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                >
                  <input
                    type="file"
                    className="hidden"
                    accept="audio/*"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                  />
                  <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">
                      Drag and drop an audio file here, or{' '}
                      <button
                        type="button"
                        className="text-primary-600 hover:text-primary-500 font-medium"
                        onClick={() => fileInputRef.current.click()}
                      >
                        browse
                      </button>
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Supports MP3, WAV, M4A up to 20MB
                    </p>
                  </div>
                </div>
              )}
              
              <button
                onClick={handleTranscribe}
                disabled={!file || processing}
                className="w-full btn btn-primary flex justify-center items-center"
              >
                {processing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Transcribing...
                  </>
                ) : 'Transcribe Audio'}
              </button>
            </div>
          </div>
          
          {/* Session Details */}
          {transcribed && (
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Session Details</h2>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                      Session Title
                    </label>
                    <input
                      type="text"
                      id="title"
                      className="input"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                  
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
                  
                  <button
                    onClick={handleSaveSession}
                    disabled={saving || !title.trim()}
                    className="w-full btn btn-primary flex justify-center items-center"
                  >
                    {saving ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : 'Save Session'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Results Section */}
        <div>
          {transcribed ? (
            <div className="space-y-6">
              {/* Summary */}
              <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Summary</h2>
                  <div className="prose max-w-none">
                    {summary.split('\n').map((line, index) => (
                      <p key={index} className="mb-2">{line}</p>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Transcript */}
              <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Transcript</h2>
                  <div className="prose max-w-none">
                    <pre className="whitespace-pre-wrap font-sans text-gray-700">
                      {transcript}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow-md rounded-lg p-12 text-center">
              <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No transcript yet</h3>
              <p className="mt-1 text-gray-500">
                Upload and transcribe an audio file to see the results here
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Upload;