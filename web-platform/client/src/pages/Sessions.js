import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MagnifyingGlassIcon, TrashIcon, TagIcon, ClockIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import moment from 'moment';
import toast from 'react-hot-toast';
import { getSessions, searchSessions, deleteSession } from '../services/sessionService';

const Sessions = () => {
  const [sessions, setSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const data = await getSessions();
        setSessions(data);
        setFilteredSessions(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching sessions:', error);
        toast.error('Failed to load sessions');
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setFilteredSessions(sessions);
      return;
    }

    try {
      const results = await searchSessions(searchQuery);
      setFilteredSessions(results);
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed. Please try again.');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleDelete = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (window.confirm('Are you sure you want to delete this session?')) {
      try {
        await deleteSession(id);
        setSessions(sessions.filter(session => session._id !== id));
        setFilteredSessions(filteredSessions.filter(session => session._id !== id));
        toast.success('Session deleted successfully');
      } catch (error) {
        console.error('Delete error:', error);
        toast.error('Failed to delete session');
      }
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-10 bg-gray-200 rounded mb-8"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-md mb-4">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Sessions</h1>
        <p className="text-gray-600">
          View and manage all your transcription sessions
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative mb-8">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          placeholder="Search sessions by keywords or content..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          onClick={handleSearch}
          className="absolute inset-y-0 right-0 px-4 text-sm text-white bg-primary-600 rounded-r-md hover:bg-primary-700"
        >
          Search
        </button>
      </div>

      {/* Sessions List */}
      <div className="space-y-4">
        {filteredSessions.length > 0 ? (
          filteredSessions.map((session) => (
            <Link
              key={session._id}
              to={`/sessions/${session._id}`}
              className="block"
            >
              <div className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-primary-700">{session.title}</h2>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500 flex items-center">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        {moment(session.createdAt).format('MMM D, YYYY')}
                      </span>
                      <button
                        onClick={(e) => handleDelete(session._id, e)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete session"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                    {session.summary.split('\n')[0]}
                  </p>
                  <div className="mt-4 flex items-center">
                    {session.isPrivate && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 mr-2">
                        Private
                      </span>
                    )}
                    {session.stressMarked && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mr-2">
                        Stress-Marked
                      </span>
                    )}
                    {session.duration && (
                      <span className="inline-flex items-center text-xs text-gray-500">
                        <ClockIcon className="h-3 w-3 mr-1" />
                        {Math.floor(session.duration / 60)}m {session.duration % 60}s
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="bg-white p-12 rounded-lg shadow-md text-center">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No sessions found</h3>
            <p className="mt-1 text-gray-500">
              {searchQuery ? 'No results match your search criteria.' : 'You haven\'t created any sessions yet.'}
            </p>
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilteredSessions(sessions);
                }}
                className="mt-4 text-primary-600 hover:text-primary-500"
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sessions;