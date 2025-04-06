import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getSessions } from '../services/sessionService';
import { getWellnessTips } from '../services/wellnessService';
import AudioRecorder from './AudioRecorder';
import { ClockIcon, DocumentTextIcon, TagIcon, BoltIcon } from '@heroicons/react/24/outline';
import moment from 'moment';

const Dashboard = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [recentSessions, setRecentSessions] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    thisWeek: 0,
    thisMonth: 0
  });
  const [wellnessTip, setWellnessTip] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch sessions
        const sessionsData = await getSessions();
        setSessions(sessionsData);
        
        // Get recent sessions (last 5)
        setRecentSessions(sessionsData.slice(0, 5));
        
        // Calculate stats
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const weekStart = new Date();
        weekStart.setDate(today.getDate() - today.getDay());
        weekStart.setHours(0, 0, 0, 0);
        
        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);
        
        const todaySessions = sessionsData.filter(s => new Date(s.createdAt) >= today).length;
        const weekSessions = sessionsData.filter(s => new Date(s.createdAt) >= weekStart).length;
        const monthSessions = sessionsData.filter(s => new Date(s.createdAt) >= monthStart).length;
        
        setStats({
          total: sessionsData.length,
          today: todaySessions,
          thisWeek: weekSessions,
          thisMonth: monthSessions
        });
        
        // Fetch wellness tip
        const wellnessData = await getWellnessTips();
        setWellnessTip(wellnessData.tip);
        
        setLoading(false);
      } catch (error) {
        console.error('Dashboard data fetch error:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded max-w-md mx-auto mb-12"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow-md">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.name}</h1>
        <p className="mt-1 text-xl text-gray-600">
          Here's an overview of your notes and sessions
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-secondary-500 mb-2">Total Sessions</h3>
          <p className="text-3xl font-bold text-primary-600">{stats.total}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-secondary-500 mb-2">Today's Sessions</h3>
          <p className="text-3xl font-bold text-primary-600">{stats.today}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-secondary-500 mb-2">This Week</h3>
          <p className="text-3xl font-bold text-primary-600">{stats.thisWeek}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-secondary-500 mb-2">This Month</h3>
          <p className="text-3xl font-bold text-primary-600">{stats.thisMonth}</p>
        </div>
      </div>

      {/* Wellness Tip */}
      <div className="bg-primary-50 border-l-4 border-primary-500 p-4 rounded-md mb-8">
        <div className="flex">
          <div className="flex-shrink-0">
            <BoltIcon className="h-5 w-5 text-primary-500" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-primary-800">Wellness Tip</h3>
            <div className="mt-2 text-primary-700">
              <p>{wellnessTip}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Recent Sessions</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {recentSessions.length > 0 ? (
            recentSessions.map(session => (
              <Link 
                key={session._id} 
                to={`/sessions/${session._id}`}
                className="block hover:bg-gray-50"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-primary-600">{session.title}</h3>
                    <div className="flex items-center text-sm text-gray-500">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      {moment(session.createdAt).fromNow()}
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                    {session.summary.split('\n')[0]}
                  </p>
                </div>
              </Link>
            ))
          ) : (
            <div className="p-6 text-center text-gray-500">
              <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2">No sessions yet. Start recording or uploading audio to get started.</p>
            </div>
          )}
        </div>
        {recentSessions.length > 0 && (
          <div className="bg-gray-50 p-4 border-t border-gray-200">
            <Link
              to="/sessions"
              className="text-primary-600 hover:text-primary-900 font-medium"
            >
              View all sessions
            </Link>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Audio</h3>
          <p className="text-gray-600 mb-4">
            Upload an audio file to get it transcribed and summarized instantly.
          </p>
          <Link
            to="/upload"
            className="btn btn-primary inline-block"
          >
            Upload Audio
          </Link>
        </div>
        <AudioRecorder />
      </div>
    </div>
  );
};

export default Dashboard;