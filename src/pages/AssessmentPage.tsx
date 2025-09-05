import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Save, AlertCircle } from 'lucide-react';
import { Layout } from '../components/Layout';
import { AudioRecorder } from '../components/AudioRecorder';
import { QuestionCard } from '../components/QuestionCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { StorageService } from '../services/storage';
import { WhisperService } from '../services/azureWhisper';
import { GPTService } from '../services/azureGPT';
import { getQuestionsForAge } from '../data/questions';
import { Child, Question, QAResult, SessionSummary, RootCause } from '../types';
import { ROOT_CAUSES } from '../utils/constants';

export const AssessmentPage: React.FC = () => {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  
  const [child, setChild] = useState<Child | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [results, setResults] = useState<QAResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [sessionSummary, setSessionSummary] = useState<SessionSummary | null>(null);
  const [doctorNotes, setDoctorNotes] = useState('');
  const [overrideRootCause, setOverrideRootCause] = useState<RootCause | ''>('');

  useEffect(() => {
    if (childId) {
      loadChild();
    }
  }, [childId]);

  const loadChild = () => {
    if (!childId) return;
    
    const childData = StorageService.getChildById(childId);
    if (!childData) {
      navigate('/children');
      return;
    }
    
    setChild(childData);
    const questionsForAge = getQuestionsForAge(childData.ageGroup);
    setQuestions(questionsForAge);
  };

  const handleRecordingComplete = async (audioBlob: Blob) => {
    if (!child || !questions[currentQuestionIndex]) return;
    
    setIsProcessing(true);
    setError('');
    
    try {
      // Step 1: Transcribe audio
      const transcript = await WhisperService.transcribeAudio(audioBlob);
      
      if (!transcript.trim()) {
        throw new Error('No speech detected. Please try recording again.');
      }
      
      // Step 2: Analyze with GPT
      const analysis = await GPTService.analyzeResponse(
        transcript,
        questions[currentQuestionIndex].text,
        child.ageGroup
      );
      
      // Step 3: Create result
      const result: QAResult = {
        question: questions[currentQuestionIndex].text,
        transcript,
        child_response: analysis.child_response,
        keywords_detected: analysis.keywords_detected,
        predicted_root_cause: analysis.predicted_root_cause,
        confidence: analysis.confidence,
        explanation: analysis.explanation
      };
      
      // Update results
      const newResults = [...results];
      newResults[currentQuestionIndex] = result;
      setResults(newResults);
      
      // Auto-advance to next question if not the last one
      if (currentQuestionIndex < questions.length - 1) {
        setTimeout(() => {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
        }, 2000);
      } else {
        // Generate session summary
        generateSessionSummary(newResults);
      }
      
    } catch (err) {
      console.error('Error processing recording:', err);
      setError(err instanceof Error ? err.message : 'Failed to process recording');
    } finally {
      setIsProcessing(false);
    }
  };

  const generateSessionSummary = (finalResults: QAResult[]) => {
    // Count root causes
    const rootCauseCount: Record<string, number> = {};
    const rootCauseConfidence: Record<string, number[]> = {};
    
    finalResults.forEach(result => {
      const cause = result.predicted_root_cause;
      rootCauseCount[cause] = (rootCauseCount[cause] || 0) + 1;
      
      if (!rootCauseConfidence[cause]) {
        rootCauseConfidence[cause] = [];
      }
      
      const confidenceScore = result.confidence === 'High' ? 3 : result.confidence === 'Medium' ? 2 : 1;
      rootCauseConfidence[cause].push(confidenceScore);
    });
    
    // Calculate weighted scores (frequency + average confidence)
    const weightedScores: Array<{ cause: RootCause; score: number; count: number; avgConfidence: number }> = [];
    
    Object.entries(rootCauseCount).forEach(([cause, count]) => {
      const confidenceScores = rootCauseConfidence[cause];
      const avgConfidence = confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length;
      const score = count * avgConfidence;
      
      weightedScores.push({
        cause: cause as RootCause,
        score,
        count,
        avgConfidence
      });
    });
    
    // Sort by score
    weightedScores.sort((a, b) => b.score - a.score);
    
    const overallRootCause = weightedScores[0]?.cause || 'Uncertain';
    const alternatives = weightedScores.slice(1, 3).map(item => item.cause);
    
    // Generate rationale
    const topResult = weightedScores[0];
    const rationale = topResult 
      ? `The assessment identified "${topResult.cause}" as the primary concern, appearing in ${topResult.count} of ${finalResults.length} responses with ${topResult.avgConfidence > 2.5 ? 'high' : topResult.avgConfidence > 1.5 ? 'medium' : 'low'} confidence. This suggests the child's digital usage patterns are primarily driven by ${topResult.cause.toLowerCase()}.`
      : 'The assessment results were inconclusive. Further evaluation may be needed to determine the primary root cause.';
    
    const summary: SessionSummary = {
      id: Date.now().toString(),
      childId: child!.id,
      childName: child!.name,
      date: new Date().toISOString(),
      results: finalResults,
      overallRootCause,
      alternatives,
      rationale,
      doctorNotes: ''
    };
    
    setSessionSummary(summary);
  };

  const saveSession = () => {
    if (!sessionSummary) return;
    
    const finalSummary = {
      ...sessionSummary,
      doctorNotes,
      overallRootCause: overrideRootCause || sessionSummary.overallRootCause
    };
    
    StorageService.addSession(finalSummary);
    navigate(`/report/${finalSummary.id}`);
  };

  const goToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const currentQuestion = questions[currentQuestionIndex];
  const currentResult = results[currentQuestionIndex];
  const isCompleted = results.length === questions.length && results.every(r => r);

  if (!child) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner text="Loading child data..." />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/children')}
              className="btn-secondary flex items-center space-x-2"
            >
              <ArrowLeft size={18} />
              <span>Back to Children</span>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-clinical-800">
                Assessment for {child.name}
              </h1>
              <p className="text-clinical-600">
                Age {child.age} • Group {child.ageGroup} • Progress: {results.filter(r => r).length}/{questions.length}
              </p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-clinical-800">Assessment Progress</h2>
            <span className="text-sm text-clinical-600">
              {Math.round((results.filter(r => r).length / questions.length) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-clinical-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(results.filter(r => r).length / questions.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Question Navigation Sidebar */}
          <div className="lg:col-span-1">
            <div className="card">
              <h3 className="text-lg font-semibold text-clinical-800 mb-4">Questions</h3>
              <div className="space-y-2">
                {questions.map((question, index) => (
                  <button
                    key={question.id}
                    onClick={() => goToQuestion(index)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      index === currentQuestionIndex
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : results[index]
                          ? 'border-green-200 bg-green-50 text-green-700'
                          : 'border-clinical-200 hover:bg-clinical-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Q{index + 1}</span>
                      {results[index] && (
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                      )}
                    </div>
                    <p className="text-xs text-clinical-600 mt-1 truncate">
                      {question.text}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Assessment Area */}
          <div className="lg:col-span-2 space-y-6">
            {!sessionSummary ? (
              <>
                {/* Current Question */}
                {currentQuestion && (
                  <QuestionCard
                    question={currentQuestion}
                    questionNumber={currentQuestionIndex + 1}
                    totalQuestions={questions.length}
                    result={currentResult}
                    isActive={true}
                  />
                )}

                {/* Recording Area */}
                <div className="card">
                  <h3 className="text-lg font-semibold text-clinical-800 mb-4">
                    Record Response
                  </h3>
                  
                  {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="text-red-500" size={20} />
                        <span className="text-red-700 text-sm">{error}</span>
                      </div>
                    </div>
                  )}

                  {isProcessing ? (
                    <div className="text-center py-8">
                      <LoadingSpinner text="Processing audio..." />
                      <p className="text-clinical-600 mt-4">
                        Transcribing speech and analyzing response...
                      </p>
                    </div>
                  ) : (
                    <AudioRecorder
                      onRecordingComplete={handleRecordingComplete}
                      disabled={!!currentResult}
                      maxDuration={120}
                    />
                  )}

                  {currentResult && (
                    <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-green-700 text-sm font-medium">
                        ✓ Response recorded and analyzed
                      </p>
                    </div>
                  )}
                </div>

                {/* Navigation */}
                <div className="flex justify-between">
                  <button
                    onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                    disabled={currentQuestionIndex === 0}
                    className="btn-secondary flex items-center space-x-2 disabled:opacity-50"
                  >
                    <ArrowLeft size={18} />
                    <span>Previous</span>
                  </button>

                  {currentQuestionIndex < questions.length - 1 ? (
                    <button
                      onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                      className="btn-primary flex items-center space-x-2"
                    >
                      <span>Next</span>
                      <ArrowRight size={18} />
                    </button>
                  ) : isCompleted ? (
                    <button
                      onClick={() => generateSessionSummary(results)}
                      className="btn-primary flex items-center space-x-2"
                    >
                      <Save size={18} />
                      <span>Complete Assessment</span>
                    </button>
                  ) : (
                    <button
                      disabled
                      className="btn-secondary opacity-50 flex items-center space-x-2"
                    >
                      <span>Complete All Questions</span>
                    </button>
                  )}
                </div>
              </>
            ) : (
              /* Session Summary */
              <div className="space-y-6">
                <div className="card">
                  <h2 className="text-xl font-bold text-clinical-800 mb-4">
                    Assessment Complete
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 bg-primary-50 rounded-lg">
                      <h3 className="text-lg font-semibold text-primary-700">Primary Root Cause</h3>
                      <p className="text-primary-600 mt-2">{sessionSummary.overallRootCause}</p>
                    </div>
                    
                    <div className="text-center p-4 bg-clinical-50 rounded-lg">
                      <h3 className="text-lg font-semibold text-clinical-700">Questions Completed</h3>
                      <p className="text-clinical-600 mt-2">{sessionSummary.results.length} / {questions.length}</p>
                    </div>
                    
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <h3 className="text-lg font-semibold text-green-700">Assessment Date</h3>
                      <p className="text-green-600 mt-2">
                        {new Date(sessionSummary.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-clinical-800 mb-2">Analysis Summary</h3>
                      <p className="text-clinical-600">{sessionSummary.rationale}</p>
                    </div>

                    {sessionSummary.alternatives.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-clinical-800 mb-2">Alternative Considerations</h3>
                        <div className="flex flex-wrap gap-2">
                          {sessionSummary.alternatives.map((alt, index) => (
                            <span key={index} className="px-3 py-1 bg-clinical-100 text-clinical-700 rounded-full text-sm">
                              {alt}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Doctor Notes and Override */}
                <div className="card">
                  <h3 className="text-lg font-semibold text-clinical-800 mb-4">
                    Doctor Notes & Override
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-clinical-700 mb-2">
                        Clinical Notes
                      </label>
                      <textarea
                        value={doctorNotes}
                        onChange={(e) => setDoctorNotes(e.target.value)}
                        rows={4}
                        className="input-field"
                        placeholder="Add any additional observations or notes..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-clinical-700 mb-2">
                        Override Root Cause (Optional)
                      </label>
                      <select
                        value={overrideRootCause}
                        onChange={(e) => setOverrideRootCause(e.target.value as RootCause)}
                        className="input-field"
                      >
                        <option value="">Use AI Assessment: {sessionSummary.overallRootCause}</option>
                        {ROOT_CAUSES.map(cause => (
                          <option key={cause} value={cause}>{cause}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Save Session */}
                <div className="flex justify-end">
                  <button
                    onClick={saveSession}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <Save size={18} />
                    <span>Save Assessment Report</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};