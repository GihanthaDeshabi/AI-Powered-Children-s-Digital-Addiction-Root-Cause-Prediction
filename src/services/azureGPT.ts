import { GPTResponse, AgeGroup } from '../types';
import { SYSTEM_PROMPT } from '../utils/constants';

export class GPTService {
  private static readonly ENDPOINT = import.meta.env.VITE_GPT_ENDPOINT;
  private static readonly API_KEY = import.meta.env.VITE_AZURE_API_KEY;

  static async analyzeResponse(
    transcript: string,
    question: string,
    ageGroup: AgeGroup
  ): Promise<GPTResponse> {
    if (!this.ENDPOINT || !this.API_KEY) {
      throw new Error('Azure GPT configuration missing');
    }

    try {
      const userMessage = JSON.stringify({
        child_age_group: ageGroup,
        question: question,
        transcript: transcript
      });

      const requestBody = {
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT
          },
          {
            role: "user", 
            content: userMessage
          }
        ],
        max_tokens: 500,
        temperature: 0.3,
        response_format: { type: "json_object" }
      };

      const response = await fetch(this.ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.API_KEY,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`GPT API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      
      if (!result.choices || !result.choices[0] || !result.choices[0].message) {
        throw new Error('Invalid response format from GPT API');
      }

      const content = result.choices[0].message.content;
      
      try {
        const parsedResponse: GPTResponse = JSON.parse(content);
        
        // Validate required fields
        if (!parsedResponse.child_response || 
            !parsedResponse.predicted_root_cause || 
            !parsedResponse.confidence ||
            !parsedResponse.explanation) {
          throw new Error('Missing required fields in GPT response');
        }

        return parsedResponse;
      } catch (parseError) {
        console.error('Error parsing GPT response:', parseError);
        throw new Error('Failed to parse GPT response as JSON');
      }
    } catch (error) {
      console.error('Error analyzing response with GPT:', error);
      throw new Error(`Failed to analyze response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async testConnection(): Promise<boolean> {
    try {
      await this.analyzeResponse(
        "I like playing games",
        "What do you like to do on devices?",
        "6-8"
      );
      return true;
    } catch (error) {
      console.error('GPT connection test failed:', error);
      return false;
    }
  }
}