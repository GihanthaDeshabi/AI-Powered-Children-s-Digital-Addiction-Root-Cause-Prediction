import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ChildrenPage } from './pages/ChildrenPage';
import { AssessmentPage } from './pages/AssessmentPage';
import { ReportPage } from './pages/ReportPage';
import { Layout } from './components/Layout';
import { StorageService } from './services/storage';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const doctor = StorageService.getDoctor();
  return doctor ? <>{children}</> : <Navigate to="/login" replace />;
};

// Reports List Page (simple wrapper to show all reports)
const ReportsListPage: React.FC = () => {
  const sessions = StorageService.getSessions();
  
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-clinical-800">Assessment Reports</h1>
          <p className="text-clinical-600 mt-1">View all completed assessments</p>
        </div>
        
        {sessions.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-clinical-500">No assessment reports available yet.</p>
          </div>
        ) : (
          <div className="card">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-clinical-200">
                <thead className="bg-clinical-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-clinical-500 uppercase tracking-wider">
                      Child
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-clinical-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-clinical-500 uppercase tracking-wider">
                      Root Cause
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-clinical-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-clinical-200">
                  {sessions.map((session) => (
                    <tr key={session.id} className="hover:bg-clinical-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-clinical-900">
                          {session.childName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-clinical-500">
                        {new Date(session.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-primary-100 text-primary-800">
                          {session.overallRootCause}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <a
                          href={`/report/${session.id}`}
                          className="text-primary-600 hover:text-primary-500"
                        >
                          View Report
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/children" 
            element={
              <ProtectedRoute>
                <ChildrenPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/assess/:childId" 
            element={
              <ProtectedRoute>
                <AssessmentPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/report/:sessionId" 
            element={
              <ProtectedRoute>
                <ReportPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/reports" 
            element={
              <ProtectedRoute>
                <ReportsListPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;