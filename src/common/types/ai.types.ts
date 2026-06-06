export interface ClassificationResult {
  intent: string;
  category: string;
  confidence: number;
}

export interface EmergencyResult {
  isEmergency: boolean;
  type: string;
  severity: string;
  confidence: number;
}