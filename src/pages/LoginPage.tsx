import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Mail, Lock, AlertCircle } from 'lucide-react';
import { HARDCODED_CREDENTIALS } from '../utils/constants';
import { StorageService } from '../services/storage';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if doctor is already logged in
    const doctor = StorageService.getDoctor();
    if (doctor) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (email === HARDCODED_CREDENTIALS.email && password === HARDCODED_CREDENTIALS.password) {
      const doctor = {
        email: HARDCODED_CREDENTIALS.email,
        name: HARDCODED_CREDENTIALS.name
      };
      
      StorageService.saveDoctor(doctor);
      navigate('/dashboard');
    } else {
      setError('Invalid email or password');
    }
    
    setIsLoading(false);
  };

  const fillDemoCredentials = () => {
    setEmail(HARDCODED_CREDENTIALS.email);
    setPassword(HARDCODED_CREDENTIALS.password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-clinical-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Activity className="text-primary-600" size={48} />
          </div>
          <h2 className="text-3xl font-bold text-clinical-800">
            Doctor Portal
          </h2>
          <p className="mt-2 text-clinical-600">
            Children's Digital Addiction Assessment Tool
          </p>
        </div>

        {/* Login Form */}
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="text-red-500" size={20} />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-clinical-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="text-clinical-400" size={20} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input-field pl-10"
                  placeholder="doctor@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-clinical-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="text-clinical-400" size={20} />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="input-field pl-10"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>Sign In</span>
              )}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={fillDemoCredentials}
                className="text-sm text-primary-600 hover:text-primary-500 underline"
              >
                Use Demo Credentials
              </button>
            </div>
          </form>
        </div>

        {/* Demo Info */}
        <div className="text-center">
          <div className="card bg-clinical-50">
            <h3 className="text-sm font-medium text-clinical-700 mb-2">Demo Credentials</h3>
            <p className="text-xs text-clinical-600 mb-1">
              <strong>Email:</strong> {HARDCODED_CREDENTIALS.email}
            </p>
            <p className="text-xs text-clinical-600">
              <strong>Password:</strong> {HARDCODED_CREDENTIALS.password}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};