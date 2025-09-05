import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Printer, FileText, Calendar, User, Brain } from 'lucide-react';
import { Layout } from '../components/Layout';
import { QuestionCard } from '../components/QuestionCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { StorageService } from '../services/storage';
import { SessionSummary } from '../types';

export const ReportPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<SessionSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (sessionId) {
      loadSession();
    }
  }, [sessionId]);

  const loadSession = () => {
    if (!sessionId) return;
    
    const sessionData = StorageService.getSessionById(sessionId);
    if (!sessionData) {
      navigate('/dashboard');
      return;
    }
    
    setSession(sessionData);
    setIsLoading(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportJSON = () => {
    if (!session) return;
    
    const dataStr = JSON.stringify(session, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `assessment_${session.childName}_${new Date(session.date).toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getConfidenceStats = () => {
    if (!session) return { high: 0, medium: 0, low: 0 };
    
    const stats = { high: 0, medium: 0, low: 0 };
    session.results.forEach(result => {
      switch (result.confidence) {
        case 'High':
          stats.high++;
          break;
        case 'Medium':
          stats.medium++;
          break;
        case 'Low':
          stats.low++;
          break;
      }
    });
    
    return stats;
  };

  const getKeywordFrequency = () => {
    if (!session) return [];
    
    const keywordCount: Record<string, number> = {};
    session.results.forEach(result => {
      result.keywords_detected.forEach(keyword => {
        keywordCount[keyword] = (keywordCount[keyword] || 0) + 1;
      });
    });
    
    return Object.entries(keywordCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([keyword, count]) => ({ keyword, count }));
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner text="Loading assessment report..." />
        </div>
      </Layout>
    );
  }

  if (!session) {
    return (
      <Layout>
        <div className="text-center py-12">
          <FileText className="mx-auto text-clinical-300" size={64} />
          <h2 className="text-xl font-semibold text-clinical-600 mt-4">Report Not Found</h2>
          <p className="text-clinical-500 mt-2">The requested assessment report could not be found.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-primary mt-4"
          >
            Return to Dashboard
          </button>
        </div>
      </Layout>
    );
  }

  const confidenceStats = getConfidenceStats();
  const topKeywords = getKeywordFrequency();

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-secondary flex items-center space-x-2"
            >
              <ArrowLeft size={18} />
              <span>Back to Dashboard</span>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-clinical-800">Assessment Report</h1>
              <p className="text-clinical-600">
                Digital Addiction Assessment for {session.childName}
              </p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={handleExportJSON}
              className="btn-secondary flex items-center space-x-2"
            >
              <Download size={18} />
              <span>Export JSON</span>
            </button>
            <button
              onClick={handlePrint}
              className="btn-primary flex items-center space-x-2"
            >
              <Printer size={18} />
              <span>Print Report</span>
            </button>
          </div>
        </div>

        {/* Print Header (visible only when printing) */}
        <div className="hidden print:block">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-clinical-800">
              Children's Digital Addiction Assessment Report
            </h1>
            <p className="text-clinical-600 mt-2">
              Comprehensive evaluation and root cause analysis
            </p>
          </div>
        </div>

        {/* Report Summary */}
        <div className="card">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-primary-100 rounded-lg">
                <User className="text-primary-600" size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-clinical-600">Child</p>
                <p className="text-lg font-semibold text-clinical-800">{session.childName}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <Calendar className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-clinical-600">Assessment Date</p>
                <p className="text-lg font-semibold text-clinical-800">
                  {formatDate(session.date)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <FileText className="text-yellow-600" size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-clinical-600">Questions</p>
                <p className="text-lg font-semibold text-clinical-800">
                  {session.results.length} completed
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Brain className="text-purple-600" size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-clinical-600">Root Cause</p>
                <p className="text-lg font-semibold text-clinical-800 truncate">
                  {session.overallRootCause}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-clinical-200 pt-6">
            <h2 className="text-xl font-bold text-clinical-800 mb-4">Assessment Summary</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-clinical-800 mb-3">Primary Finding</h3>
                <div className="p-4 bg-primary-50 rounded-lg">
                  <p className="text-primary-700 font-medium text-lg">{session.overallRootCause}</p>
                  <p className="text-clinical-600 mt-2">{session.rationale}</p>
                </div>
                
                {session.alternatives.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-md font-semibold text-clinical-800 mb-2">Alternative Considerations</h4>
                    <div className="flex flex-wrap gap-2">
                      {session.alternatives.map((alt, index) => (
                        <span key={index} className="px-3 py-1 bg-clinical-100 text-clinical-700 rounded-full text-sm">
                          {alt}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-clinical-800 mb-3">Confidence Distribution</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-green-600">High Confidence</span>
                    <span className="font-medium">{confidenceStats.high} responses</span>
                  </div>
                  <div className="w-full bg-clinical-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${(confidenceStats.high / session.results.length) * 100}%` }}
                    />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-yellow-600">Medium Confidence</span>
                    <span className="font-medium">{confidenceStats.medium} responses</span>
                  </div>
                  <div className="w-full bg-clinical-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full"
                      style={{ width: `${(confidenceStats.medium / session.results.length) * 100}%` }}
                    />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-red-600">Low Confidence</span>
                    <span className="font-medium">{confidenceStats.low} responses</span>
                  </div>
                  <div className="w-full bg-clinical-200 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full"
                      style={{ width: `${(confidenceStats.low / session.results.length) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {session.doctorNotes && (
            <div className="border-t border-clinical-200 pt-6 mt-6">
              <h3 className="text-lg font-semibold text-clinical-800 mb-3">Doctor's Notes</h3>
              <div className="p-4 bg-clinical-50 rounded-lg">
                <p className="text-clinical-700">{session.doctorNotes}</p>
              </div>
            </div>
          )}
        </div>

        {/* Keywords Analysis */}
        {topKeywords.length > 0 && (
          <div className="card">
            <h2 className="text-xl font-bold text-clinical-800 mb-4">Key Themes</h2>
            <p className="text-clinical-600 mb-4">
              Most frequently mentioned concepts during the assessment
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {topKeywords.map(({ keyword, count }, index) => (
                <div key={keyword} className="text-center p-3 bg-clinical-50 rounded-lg">
                  <p className="font-semibold text-clinical-800">{keyword}</p>
                  <p className="text-sm text-clinical-600">{count} mention{count > 1 ? 's' : ''}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Detailed Results */}
        <div className="card">
          <h2 className="text-xl font-bold text-clinical-800 mb-6">Detailed Question Analysis</h2>
          <div className="space-y-6">
            {session.results.map((result, index) => (
              <QuestionCard
                key={index}
                question={{
                  id: `q-${index}`,
                  text: result.question,
                  ageGroup: "6-8", // This doesn't matter for display
                  category: "assessment"
                }}
                questionNumber={index + 1}
                totalQuestions={session.results.length}
                result={result}
              />
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};