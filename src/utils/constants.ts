export const HARDCODED_CREDENTIALS = {
  email: "doctor@example.com",
  password: "password123",
  name: "Dr. Smith"
};

export const ROOT_CAUSES = [
  "Normal/Tech Interest",
  "Parental Neglect", 
  "Loneliness/Social Isolation",
  "Boredom/Lack of Activities",
  "Peer Pressure / Influence from Friends or Family",
  "Stress/Anxiety/Emotion Regulation",
  "Avoidance/Escape",
  "Uncertain"
] as const;

export const AGE_GROUPS = ["3-5", "6-8", "9-12"] as const;

export const CONFIDENCE_LEVELS = ["High", "Medium", "Low"] as const;

export const STORAGE_KEYS = {
  CHILDREN: "assessment_children",
  SESSIONS: "assessment_sessions",
  DOCTOR: "assessment_doctor"
} as const;

export const SYSTEM_PROMPT = `You are an assistant for pediatric digital addiction assessment. 
Analyze the child's response and return structured JSON with keys: 
child_response, keywords_detected (3–5 items), predicted_root_cause 
(choose from: ["Normal/Tech Interest","Parental Neglect","Loneliness/Social Isolation","Boredom/Lack of Activities","Peer Pressure / Influence from Friends or Family","Stress/Anxiety/Emotion Regulation","Avoidance/Escape"]), 
confidence ("High","Medium","Low"), explanation (2–3 sentences, neutral clinical tone).
If unclear or too short, set predicted_root_cause="Uncertain", confidence="Low", explanation="Further evaluation recommended."`;

export const AUDIO_CONSTRAINTS = {
  audio: {
    sampleRate: 16000,
    channelCount: 1,
    echoCancellation: true,
    noiseSuppression: true
  }
};