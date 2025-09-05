import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Home, Users, FileText, Activity } from 'lucide-react';
import { StorageService } from '../services/storage';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const doctor = StorageService.getDoctor();

  const handleLogout = () => {
    StorageService.clearDoctor();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/children', icon: Users, label: 'Children' },
    { path: '/reports', icon: FileText, label: 'Reports' },
  ];

  const isActivePath = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-clinical-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-clinical-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Activity className="text-primary-600" size={32} />
              <div>
                <h1 className="text-xl font-semibold text-clinical-800">
                  Digital Assessment Tool
                </h1>
                <p className="text-sm text-clinical-600">
                  Children's Digital Addiction Assessment
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {doctor && (
                <div className="text-right">
                  <p className="text-sm font-medium text-clinical-800">
                    {doctor.name}
                  </p>
                  <p className="text-xs text-clinical-600">
                    {doctor.email}
                  </p>
                </div>
              )}
              
              <button
                onClick={handleLogout}
                className="btn-secondary flex items-center space-x-2"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-clinical-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {navItems.map(({ path, icon: Icon, label }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 text-sm font-medium transition-colors duration-200 ${
                  isActivePath(path)
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-clinical-600 hover:text-clinical-800 hover:border-clinical-300'
                }`}
              >
                <Icon size={18} />
                <span>{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};