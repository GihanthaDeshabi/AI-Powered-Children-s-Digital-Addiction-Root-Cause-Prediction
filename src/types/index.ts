export type AgeGroup = "3-5" | "6-8" | "9-12";
export type Confidence = "High" | "Medium" | "Low";

export type RootCause = 
  | "Normal/Tech Interest"
  | "Parental Neglect"
  | "Loneliness/Social Isolation"
  | "Boredom/Lack of Activities"
  | "Peer Pressure / Influence from Friends or Family"
  | "Stress/Anxiety/Emotion Regulation"
  | "Avoidance/Escape"
  | "Uncertain";

export interface Child {
  id: string;
  name: string;
  age: number;
  ageGroup: AgeGroup;
  createdAt: string;
}

export interface Question {
  id: string;
  text: string;
  ageGroup: AgeGroup;
  category: string;
}

export interface QAResult {
  question: string;
  transcript: string;
  child_response: string;
  keywords_detected: string[];
  predicted_root_cause: RootCause;
  confidence: Confidence;
  explanation: string;
}

export interface SessionSummary {
  id: string;
  childId: string;
  childName: string;
  date: string;
  results: QAResult[];
  overallRootCause: RootCause;
  alternatives: RootCause[];
  rationale: string;
  doctorNotes?: string;
}

export interface WhisperResponse {
  text: string;
}

export interface GPTResponse {
  child_response: string;
  keywords_detected: string[];
  predicted_root_cause: RootCause;
  confidence: Confidence;
  explanation: string;
}

export interface Doctor {
  email: string;
  name: string;
}