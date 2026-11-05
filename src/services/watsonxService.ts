/**
 * IBM watsonx.ai Integration for ScamShield AI
 *
 * Uses the IBM Granite model to perform deeper AI analysis on suspicious
 * messages and URLs. Falls back gracefully to the local engine.
 */

import { ScanResult, ScanType } from '../types';
import { scanMessage, scanLink } from './detectionEngine';
import { generateId } from '../utils/helpers';

// ─── Configuration ────────────────────────────────────────────────────────────

// These are read from environment / app config. In Expo you can expose them via
// app.config.js / extra fields, or store them in AsyncStorage after user setup.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const env = process.env as any;
const WATSONX_API_KEY: string = env.EXPO_PUBLIC_WATSONX_API_KEY ?? '';
const WATSONX_PROJECT_ID: string = env.EXPO_PUBLIC_WATSONX_PROJECT_ID ?? '';
const WATSONX_REGION: string = env.EXPO_PUBLIC_WATSONX_REGION ?? 'us-south';

const WATSONX_BASE_URL = `https://${WATSONX_REGION}.ml.cloud.ibm.com`;
const GRANITE_MODEL = 'ibm/granite-13b-instruct-v2';
const IAM_TOKEN_URL = 'https://iam.cloud.ibm.com/identity/token';

// Simple in-memory IAM token cache
let iamToken: string | null = null;
let iamTokenExpiry: number = 0;

// ─── IAM Token Fetch ─────────────────────────────────────────────────────────

async function getIAMToken(): Promise<string> {
  if (iamToken && Date.now() < iamTokenExpiry - 60_000) return iamToken;

  const res = await fetch(IAM_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey=${encodeURIComponent(WATSONX_API_KEY)}`,
  });

  if (!res.ok) throw new Error(`IAM token fetch failed: ${res.status}`);
  const data = await res.json();
  iamToken = data.access_token as string;
  iamTokenExpiry = Date.now() + (data.expires_in as number) * 1000;
  return iamToken;
}

// ─── Prompt Builder ──────────────────────────────────────────────────────────

function buildPrompt(type: ScanType, input: string): string {
  const truncated = input.slice(0, 600);

  if (type === 'message') {
    return `You are a financial scam detection expert specializing in Indian financial fraud. Analyze the following SMS/message for scam indicators.

Message:
"""
${truncated}
"""

Respond ONLY with a valid JSON object with these fields:
{
  "riskScore": <number 0-100>,
  "riskLevel": <"low"|"medium"|"high">,
  "indicators": [{"type": "<string>", "description": "<string>", "severity": "<low|medium|high>", "matchedText": "<optional string>"}],
  "explanation": "<1-2 sentence explanation>",
  "recommendations": ["<action 1>", "<action 2>", "<action 3>"]
}

Rules:
- 0-20 = low risk, 21-55 = medium risk, 56-100 = high risk
- Focus on: OTP requests, fake rewards, account threats, UPI scams, fake loans, impersonation, urgency tactics
- Be conservative: only raise risk if there are clear scam signals`;
  }

  return `You are a cybersecurity expert specializing in phishing URL detection. Analyze the following URL for phishing and scam indicators.

URL:
"""
${truncated}
"""

Respond ONLY with a valid JSON object with these fields:
{
  "riskScore": <number 0-100>,
  "riskLevel": <"low"|"medium"|"high">,
  "indicators": [{"type": "<string>", "description": "<string>", "severity": "<low|medium|high>", "matchedText": "<optional string>"}],
  "explanation": "<1-2 sentence explanation>",
  "recommendations": ["<action 1>", "<action 2>", "<action 3>"]
}

Rules:
- 0-20 = low risk, 21-55 = medium risk, 56-100 = high risk
- Focus on: typosquatting, suspicious TLDs, IP addresses, phishing keywords, URL shorteners, missing HTTPS`;
}

// ─── watsonx API Call ─────────────────────────────────────────────────────────

async function callWatsonx(prompt: string): Promise<string> {
  const token = await getIAMToken();

  const body = {
    model_id: GRANITE_MODEL,
    input: prompt,
    parameters: {
      decoding_method: 'greedy',
      max_new_tokens: 400,
      stop_sequences: ['\n\n\n'],
      temperature: 0.1,
    },
    project_id: WATSONX_PROJECT_ID,
  };

  const res = await fetch(`${WATSONX_BASE_URL}/ml/v1/text/generation?version=2023-05-29`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`watsonx API error ${res.status}: ${err.slice(0, 200)}`);
  }

  const data = await res.json();
  return (data?.results?.[0]?.generated_text as string) ?? '';
}

// ─── Response Parser ──────────────────────────────────────────────────────────

function parseWatsonxResponse(raw: string, localResult: ScanResult): ScanResult {
  // Extract the first JSON object from the generated text
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON found in watsonx response');

  const parsed = JSON.parse(jsonMatch[0]);

  const riskScore = typeof parsed.riskScore === 'number' ? Math.min(100, Math.max(0, parsed.riskScore)) : localResult.riskScore;
  const riskLevel = ['low', 'medium', 'high'].includes(parsed.riskLevel) ? parsed.riskLevel : localResult.riskLevel;
  const indicators = Array.isArray(parsed.indicators) ? parsed.indicators : localResult.indicators;
  const explanation = typeof parsed.explanation === 'string' ? parsed.explanation : localResult.explanation;
  const recommendations = Array.isArray(parsed.recommendations) ? parsed.recommendations : localResult.recommendations;

  return {
    ...localResult,
    riskScore,
    riskLevel,
    indicators,
    explanation,
    recommendations,
    analyzedBy: 'watsonx',
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function isWatsonxConfigured(): boolean {
  return !!(WATSONX_API_KEY && WATSONX_PROJECT_ID);
}

export async function analyzeWithWatsonx(type: ScanType, input: string): Promise<ScanResult> {
  // Always run local engine first
  const localResult = type === 'message' ? scanMessage(input) : scanLink(input);

  if (!isWatsonxConfigured()) {
    return localResult;
  }

  try {
    const prompt = buildPrompt(type, input);
    const raw = await callWatsonx(prompt);
    const enhanced = parseWatsonxResponse(raw, localResult);
    return { ...enhanced, id: generateId(), timestamp: Date.now() };
  } catch (err) {
    console.warn('[watsonx] Analysis failed, using local result:', err);
    // Return local result but note the fallback
    return {
      ...localResult,
      explanation:
        localResult.explanation +
        ' (Note: AI analysis was unavailable — result is based on rule-based detection.)',
    };
  }
}
