import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Square } from 'lucide-react';
import { AUDIO_CONSTRAINTS } from '../utils/constants';

interface AudioRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  onRecordingStart?: () => void;
  onRecordingStop?: () => void;
  disabled?: boolean;
  maxDuration?: number; // in seconds
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onRecordingComplete,
  onRecordingStart,
  onRecordingStop,
  disabled = false,
  maxDuration = 120 // 2 minutes default
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    checkMicrophonePermission();
    return cleanup;
  }, []);

  const checkMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(AUDIO_CONSTRAINTS);
      setHasPermission(true);
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      console.error('Microphone permission denied:', error);
      setHasPermission(false);
    }
  };

  const startRecording = async () => {
    if (disabled || isRecording) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia(AUDIO_CONSTRAINTS);
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        onRecordingComplete(audioBlob);
        cleanup();
      };

      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      setDuration(0);
      onRecordingStart?.();

      // Start duration timer
      intervalRef.current = setInterval(() => {
        setDuration(prev => {
          const newDuration = prev + 1;
          if (newDuration >= maxDuration) {
            stopRecording();
          }
          return newDuration;
        });
      }, 1000);

    } catch (error) {
      console.error('Error starting recording:', error);
      setHasPermission(false);
    }
  };

  const stopRecording = () => {
    if (!isRecording || !mediaRecorderRef.current) return;

    mediaRecorderRef.current.stop();
    setIsRecording(false);
    onRecordingStop?.();
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    mediaRecorderRef.current = null;
    setIsRecording(false);
    setDuration(0);
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (hasPermission === false) {
    return (
      <div className="card text-center">
        <MicOff className="mx-auto mb-2 text-red-500" size={24} />
        <p className="text-clinical-600 mb-4">Microphone access is required for voice recording</p>
        <button
          onClick={checkMicrophonePermission}
          className="btn-primary"
        >
          Grant Microphone Access
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="flex items-center space-x-4">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={disabled || hasPermission === null}
          className={`mic-button w-16 h-16 rounded-full flex items-center justify-center text-white font-semibold transition-all duration-200 ${
            isRecording 
              ? 'recording bg-red-500 hover:bg-red-600' 
              : 'bg-primary-600 hover:bg-primary-700'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isRecording ? <Square size={24} /> : <Mic size={24} />}
        </button>
        
        {isRecording && (
          <div className="flex items-center space-x-2">
            <div className="recording-indicator"></div>
            <span className="text-clinical-600 font-mono">
              {formatDuration(duration)}
            </span>
          </div>
        )}
      </div>

      <div className="text-center">
        <p className="text-sm text-clinical-600">
          {isRecording 
            ? 'Recording... Click to stop' 
            : 'Click to start recording'
          }
        </p>
        {maxDuration && (
          <p className="text-xs text-clinical-400 mt-1">
            Max duration: {formatDuration(maxDuration)}
          </p>
        )}
      </div>
    </div>
  );
};