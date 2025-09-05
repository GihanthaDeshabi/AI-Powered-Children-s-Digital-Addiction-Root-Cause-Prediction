import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Users, FileText, Activity, Calendar, TrendingUp } from 'lucide-react';
import { Layout } from '../components/Layout';
import { StorageService } from '../services/storage';
import { Child, SessionSummary } from '../types';

export const DashboardPage: React.FC = () => {
  const [children, setChildren] = useState<Child[]>([]);
  const [recentSessions, setRecentSessions] = useState<SessionSummary[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const allChildren = StorageService.getChildren();
    const allSessions = StorageService.getSessions();
    
    setChildren(allChildren);
    
    // Get recent sessions (last 10)
    const sortedSessions = allSessions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);
    
    setRecentSessions(sortedSessions);
  };

  const getChildName = (childId: string) => {
    const child = children.find(c => c.id === childId);
    return child?.name || 'Unknown';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSessionStats = () => {
    const totalSessions = recentSessions.length;
    const thisWeek = recentSessions.filter(session => {
      const sessionDate = new Date(session.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return sessionDate >= weekAgo;
    }).length;

    return { totalSessions, thisWeek };
  };

  const stats = getSessionStats();

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-clinical-800">Dashboard</h1>
            <p className="text-clinical-600 mt-1">
              Overview of your assessments and children
            </p>
          </div>
          
          <div className="flex space-x-3">
            <Link to="/children" className="btn-secondary flex items-center space-x-2">
              <Users size={18} />
              <span>Manage Children</span>
            </Link>
            <Link to="/children/new" className="btn-primary flex items-center space-x-2">
              <Plus size={18} />
              <span>Add Child</span>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-clinical-600">Total Children</p>
                <p className="text-2xl font-bold text-clinical-800">{children.length}</p>
              </div>
              <div className="p-3 bg-primary-100 rounded-lg">
                <Users className="text-primary-600" size={24} />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-clinical-600">Total Sessions</p>
                <p className="text-2xl font-bold text-clinical-800">{stats.totalSessions}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <FileText className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-clinical-600">This Week</p>
                <p className="text-2xl font-bold text-clinical-800">{stats.thisWeek}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Calendar className="text-yellow-600" size={24} />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-clinical-600">Avg per Child</p>
                <p className="text-2xl font-bold text-clinical-800">
                  {children.length > 0 ? Math.round(stats.totalSessions / children.length * 10) / 10 : 0}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="text-purple-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Children */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-clinical-800">Recent Children</h2>
              <Link to="/children" className="text-primary-600 hover:text-primary-500 text-sm font-medium">
                View All
              </Link>
            </div>
            
            {children.length === 0 ? (
              <div className="text-center py-8">
                <Users className="mx-auto text-clinical-300" size={48} />
                <p className="text-clinical-500 mt-4">No children added yet</p>
                <Link to="/children/new" className="btn-primary mt-4">
                  Add First Child
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {children.slice(0, 5).map((child) => (
                  <div key={child.id} className="flex items-center justify-between p-3 bg-clinical-50 rounded-lg">
                    <div>
                      <p className="font-medium text-clinical-800">{child.name}</p>
                      <p className="text-sm text-clinical-600">
                        Age {child.age} • Group {child.ageGroup}
                      </p>
                    </div>
                    <Link
                      to={`/assess/${child.id}`}
                      className="btn-primary text-sm"
                    >
                      Start Assessment
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Sessions */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-clinical-800">Recent Sessions</h2>
              <Link to="/reports" className="text-primary-600 hover:text-primary-500 text-sm font-medium">
                View All
              </Link>
            </div>
            
            {recentSessions.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="mx-auto text-clinical-300" size={48} />
                <p className="text-clinical-500 mt-4">No assessments completed yet</p>
                <p className="text-clinical-400 text-sm mt-2">
                  Start by adding a child and running an assessment
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentSessions.slice(0, 5).map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-3 bg-clinical-50 rounded-lg">
                    <div>
                      <p className="font-medium text-clinical-800">{session.childName}</p>
                      <p className="text-sm text-clinical-600">
                        {formatDate(session.date)}
                      </p>
                      <span className="inline-block px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs mt-1">
                        {session.overallRootCause}
                      </span>
                    </div>
                    <Link
                      to={`/report/${session.id}`}
                      className="btn-secondary text-sm"
                    >
                      View Report
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};