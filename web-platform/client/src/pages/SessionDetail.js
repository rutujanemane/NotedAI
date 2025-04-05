import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ClockIcon, TagIcon, DownloadIcon, PencilIcon, ArrowDownTrayIcon, XMarkIcon, LightBulbIcon } from '@heroicons/react/24/outline';
import moment from 'moment';
import toast from 'react-hot-toast';
import { getSessionById, updateSession, askQuestion } from '../services/sessionService';

const SessionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editIsPrivate, setEditIsPrivate] = useState(false);
  const [editStressMarked, setEditStressMarked] = useState(false);
  const [editTags, setEditTags] = useState([]);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [askingQuestion, setAskingQuestion] = useState(false);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const data = await getSessionById(id);
        setSession(data);
        setEditTitle(data.title);
        setEditIsPrivate(data.isPrivate);
        setEditStressMarked(data.stressMarked);
        setEditTags(data.tags || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching session:', error);
        toast.error('Failed to load session');
        setLoading(false);
        navigate('/sessions');
      }
    };

    fetchSession();
  }, [id, navigate]);

  const handleEdit = () => {
    setEditing(true);
  };

  const handleSave = async () => {
    try {
      const updatedSession = await updateSession(id, {
        title: editTitle,
        isPrivate: editIsPrivate,
        stressMarked: editStressMarked,
        tags: editTags
      });
      
      setSession(updatedSession);
      setEditing(false);
      toast.success('Session updated successfully');
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update session');
    }
  };

  const handleAskQuestion = async () => {
    if (!question.trim()) return;
    
    try {
      setAskingQuestion(true);
      const response = await askQuestion(id, question);
      setAnswer(response.answer);
      setAskingQuestion(false);
    } catch (error) {
      console.error('Question error:', error);
      toast.error('Failed to process your question');
      setAskingQuestion(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAskQuestion();
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <div className="h-40 bg-gray-200 rounded mb-4"></div>
              <div className="h-60 bg-gray-200 rounded"></div>
            </div>
            <div>
              <div className="h-20 bg-gray-200 rounded mb-4"></div>
              <div className="h-60 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Session not found</h2>
          <p className="mt-2 text-gray-600">
            The session you're looking for doesn't exist or you don't have permission to view it.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-6">
        {editing ? (
          <div className="flex items-center mb-4">
            <input
              type="text"
              className="text-3xl font-bold text-gray-900 border-b border-gray-300 focus:border-primary-500 focus:ring-0 w-full"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
            />
            <button
              onClick={handleSave}
              className="ml-2 p-2 text-green-600 hover:text-green-800"
              title="Save changes"
            >
              <ArrowDownTrayIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => setEditing(false)}
              className="ml-2 p-2 text-red-600 hover:text-red-800"
              title="Cancel editing"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">{session.title}</h1>
            <button
              onClick={handleEdit}
              className="p-2 text-gray-600 hover:text-gray-800"
              title="Edit session"
            >
              <PencilIcon className="h-5 w-5" />
            </button>
          </div>
        )}
        <div className="flex items-center text-sm text-gray-500">
          <ClockIcon className="h-4 w-4 mr-1" />
          {moment(session.createdAt).format('MMMM D, YYYY [at] h:mm A')}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Summary */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Summary</h2>
              <div className="prose max-w-none">
                {session.summary.split('\n').map((line, index) => (
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
                  {session.transcript}
                </pre>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Session Info */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Session Information</h2>
              
              {editing ? (
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isPrivate"
                      checked={editIsPrivate}
                      onChange={(e) => setEditIsPrivate(e.target.checked)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isPrivate" className="ml-2 block text-sm text-gray-700">
                      Private Session
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="stressMarked"
                      checked={editStressMarked}
                      onChange={(e) => setEditStressMarked(e.target.checked)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="stressMarked" className="ml-2 block text-sm text-gray-700">
                      Stress-Marked
                    </label>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Private:</span>
                    <span className="font-medium text-gray-900">
                      {session.isPrivate ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Stress-Marked:</span>
                    <span className="font-medium text-gray-900">
                      {session.stressMarked ? 'Yes' : 'No'}
                    </span>
                  </div>
                  {session.duration && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Duration:</span>
                      <span className="font-medium text-gray-900">
                        {Math.floor(session.duration / 60)}m {session.duration % 60}s
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Ask Questions */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Ask Questions About This Session
              </h2>
              <div className="mb-4">
                <textarea
                  rows="3"
                  placeholder="Ask a question about this transcript..."
                  className="w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={handleKeyDown}
                ></textarea>
                <button
                  onClick={handleAskQuestion}
                  disabled={askingQuestion || !question.trim()}
                  className="mt-2 w-full btn btn-primary flex justify-center items-center"
                >
                  {askingQuestion ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : 'Ask Question'}
                </button>
              </div>
              
              {answer && (
                <div className="mt-4 bg-gray-50 p-4 rounded-md">
                  <div className="flex items-start">
                    <LightBulbIcon className="h-5 w-5 text-primary-600 mt-0.5 mr-2" />
                    <div className="prose prose-sm">
                      {answer.split('\n').map((line, index) => (
                        <p key={index} className={index > 0 ? 'mt-2' : ''}>{line}</p>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionDetail;