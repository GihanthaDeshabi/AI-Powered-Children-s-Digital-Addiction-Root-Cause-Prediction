import React from 'react';
import { Question, QAResult } from '../types';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  result?: QAResult;
  isActive?: boolean;
  onQuestionClick?: () => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  questionNumber,
  totalQuestions,
  result,
  isActive = false,
  onQuestionClick
}) => {
  const getStatusIcon = () => {
    if (result) {
      return <CheckCircle className="text-green-500" size={20} />;
    }
    if (isActive) {
      return <Clock className="text-primary-500" size={20} />;
    }
    return <div className="w-5 h-5 rounded-full border-2 border-clinical-300" />;
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'High': return 'text-green-600';
      case 'Medium': return 'text-yellow-600';
      case 'Low': return 'text-red-600';
      default: return 'text-clinical-500';
    }
  };

  return (
    <div 
      className={`card cursor-pointer transition-all duration-200 ${
        isActive 
          ? 'ring-2 ring-primary-500 bg-primary-50' 
          : result 
            ? 'bg-green-50 border-green-200' 
            : 'hover:bg-clinical-100'
      }`}
      onClick={onQuestionClick}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-1">
          {getStatusIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-clinical-600">
              Question {questionNumber} of {totalQuestions}
            </span>
            {result && (
              <span className={`text-xs font-medium ${getConfidenceColor(result.confidence)}`}>
                {result.confidence} Confidence
              </span>
            )}
          </div>
          
          <h3 className="text-lg font-medium text-clinical-800 mb-3">
            {question.text}
          </h3>
          
          {result && (
            <div className="space-y-2">
              <div>
                <p className="text-sm font-medium text-clinical-700 mb-1">Response:</p>
                <p className="text-sm text-clinical-600 italic">"{result.child_response}"</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-clinical-700 mb-1">Root Cause:</p>
                <span className="inline-block px-2 py-1 bg-primary-100 text-primary-700 rounded text-sm">
                  {result.predicted_root_cause}
                </span>
              </div>
              
              {result.keywords_detected.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-clinical-700 mb-1">Keywords:</p>
                  <div className="flex flex-wrap gap-1">
                    {result.keywords_detected.map((keyword, index) => (
                      <span 
                        key={index}
                        className="inline-block px-2 py-1 bg-clinical-100 text-clinical-600 rounded-full text-xs"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <p className="text-sm font-medium text-clinical-700 mb-1">Analysis:</p>
                <p className="text-sm text-clinical-600">{result.explanation}</p>
              </div>
            </div>
          )}
          
          {isActive && !result && (
            <div className="flex items-center space-x-2 text-primary-600">
              <AlertCircle size={16} />
              <span className="text-sm">Ready for recording</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};