// Types for ScamShield AI

export type RiskLevel = 'low' | 'medium' | 'high' | 'unknown';

export type ScanType = 'message' | 'link';

export interface ScamIndicator {
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  matchedText?: string;
}

export interface ScanResult {
  id: string;
  type: ScanType;
  input: string;
  riskScore: number;         // 0–100
  riskLevel: RiskLevel;
  indicators: ScamIndicator[];
  explanation: string;
  recommendations: string[];
  analyzedBy: 'local' | 'watsonx';
  timestamp: number;
}

export interface WatsonxConfig {
  apiKey: string;
  projectId: string;
  region: string; // e.g. 'us-south'
}

export interface ScamPattern {
  id: string;
  regex: RegExp;
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  weight: number; // contribution to risk score
}

export interface AwarenessCategory {
  id: string;
  title: string;
  icon: string;
  color: string;
  description: string;
  tips: string[];
  redFlags: string[];
}
