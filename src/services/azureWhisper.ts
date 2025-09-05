import { WhisperResponse } from '../types';

export class WhisperService {
  private static readonly ENDPOINT = import.meta.env.VITE_WHISPER_ENDPOINT;
  private static readonly API_KEY = import.meta.env.VITE_AZURE_API_KEY;

  static async transcribeAudio(audioBlob: Blob): Promise<string> {
    if (!this.ENDPOINT || !this.API_KEY) {
      throw new Error('Azure Whisper configuration missing');
    }

    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.wav');
      formData.append('model', 'whisper-1');

      const response = await fetch(this.ENDPOINT, {
        method: 'POST',
        headers: {
          'api-key': this.API_KEY,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Whisper API error: ${response.status} - ${errorText}`);
      }

      const result: WhisperResponse = await response.json();
      return result.text || '';
    } catch (error) {
      console.error('Error transcribing audio:', error);
      throw new Error(`Failed to transcribe audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async testConnection(): Promise<boolean> {
    try {
      // Create a small silent audio blob for testing
      const audioContext = new AudioContext();
      const buffer = audioContext.createBuffer(1, 1024, 16000);
      const arrayBuffer = buffer.getChannelData(0);
      
      // Convert to blob (simplified test)
      const blob = new Blob([arrayBuffer], { type: 'audio/wav' });
      
      await this.transcribeAudio(blob);
      return true;
    } catch (error) {
      console.error('Whisper connection test failed:', error);
      return false;
    }
  }
}