/**
 * ScamShield AI — Local Rule-Based Detection Engine
 *
 * Analyses messages and URLs for financial scam patterns without any network
 * calls. Used as the primary detector (and fallback when watsonx is unavailable).
 */

import { ScamIndicator, ScamPattern, ScanResult, RiskLevel, ScanType } from '../types';
import { generateId } from '../utils/helpers';

// ─── Message Scam Patterns ───────────────────────────────────────────────────

const MESSAGE_PATTERNS: ScamPattern[] = [
  // OTP / Credential theft
  {
    id: 'otp_request',
    regex: /\b(share|send|provide|give|enter|submit).{0,30}(otp|one.?time.?password|verification code|pin)\b/i,
    type: 'OTP Request',
    description: 'Requests you to share a One-Time Password. Legitimate services NEVER ask for your OTP.',
    severity: 'high',
    weight: 35,
  },
  {
    id: 'otp_mention',
    regex: /\b(otp|one.?time.?password)\b/i,
    type: 'OTP Mention',
    description: 'Message mentions an OTP. Be cautious — scammers use urgency around OTPs.',
    severity: 'medium',
    weight: 15,
  },
  // Fake rewards / lottery
  {
    id: 'lottery_won',
    regex: /\b(won|winner|congratulations|selected|chosen).{0,50}(lottery|prize|reward|cash|crore|lakh|lucky draw)\b/i,
    type: 'Fake Lottery / Prize',
    description: 'Claims you have won a prize or lottery you did not enter.',
    severity: 'high',
    weight: 40,
  },
  {
    id: 'claim_prize',
    regex: /\b(claim|collect|redeem).{0,30}(prize|reward|cash|gift|bonus)\b/i,
    type: 'Prize Claim',
    description: 'Urges you to claim a prize or reward — common in scam messages.',
    severity: 'high',
    weight: 30,
  },
  // Urgency
  {
    id: 'urgency_expire',
    regex: /\b(expire|expir(es|ing)|last chance|limited time|within \d+ (hours?|minutes?|days?)|immediately|urgent|asap|act now|don't delay|before it's too late)\b/i,
    type: 'Urgency Tactic',
    description: 'Creates artificial urgency to pressure you into acting without thinking.',
    severity: 'medium',
    weight: 20,
  },
  // Fake account block / KYC
  {
    id: 'account_block',
    regex: /\b(account|kyc|card|service).{0,30}(block(ed)?|suspend(ed)?|deactivat(ed)?|closed?|terminat(ed)?|restrict(ed)?)\b/i,
    type: 'Account Threat',
    description: 'Threatens to block or suspend your account to make you react quickly.',
    severity: 'high',
    weight: 35,
  },
  {
    id: 'kyc_update',
    regex: /\b(update|complete|verify|submit).{0,30}(kyc|aadhar|pan|documents?)\b/i,
    type: 'Fake KYC Request',
    description: 'Asks you to update KYC details via a link — common banking impersonation tactic.',
    severity: 'high',
    weight: 30,
  },
  // Fake investment
  {
    id: 'guaranteed_returns',
    regex: /\b(guaranteed?|assured?|sure.?shot|risk.?free).{0,30}(return|profit|income|earning|investment)\b/i,
    type: 'Fake Investment Scheme',
    description: 'No investment is risk-free. Guaranteed return promises are a hallmark of investment fraud.',
    severity: 'high',
    weight: 40,
  },
  {
    id: 'high_returns',
    regex: /\b(\d{2,3}%|double|triple|10x|100x).{0,30}(return|profit|income|earning|investment|interest)\b/i,
    type: 'Unrealistic Returns',
    description: 'Promises of extremely high returns are a major red flag for Ponzi or pyramid schemes.',
    severity: 'high',
    weight: 35,
  },
  // UPI scams
  {
    id: 'upi_collect',
    regex: /\b(upi|gpay|phonepe|paytm|bhim).{0,40}(collect|request|pin|approve|accept)\b/i,
    type: 'UPI Collect Scam',
    description: 'Involves a UPI collect/payment request. Scammers send money requests pretending to send money.',
    severity: 'high',
    weight: 35,
  },
  {
    id: 'send_to_receive',
    regex: /\b(send|transfer|pay).{0,30}(to receive|to get|to claim|to unlock|refund|cashback)\b/i,
    type: 'Pay-to-Receive Scam',
    description: 'You never need to pay money to receive a refund or prize. This is a classic advance-fee fraud.',
    severity: 'high',
    weight: 40,
  },
  // Phishing links in messages
  {
    id: 'click_link',
    regex: /\b(click|tap|visit|open|follow|go to).{0,30}(link|url|http|www\.)\b/i,
    type: 'Suspicious Link',
    description: 'Directs you to click a link — verify carefully before opening any link.',
    severity: 'medium',
    weight: 20,
  },
  // Personal info requests
  {
    id: 'personal_info',
    regex: /\b(share|send|provide|give|submit|enter).{0,30}(account number|bank details?|card number|cvv|password|credential)\b/i,
    type: 'Personal Data Request',
    description: 'Asks for sensitive financial or personal information. Banks never request this via SMS.',
    severity: 'high',
    weight: 40,
  },
  // Impersonation
  {
    id: 'bank_impersonation',
    regex: /\b(sbi|hdfc|icici|axis|pnb|kotak|rbi|sebi|irda|income tax|govt|government|police|cbi|ed)\b.{0,60}(call|contact|urgent|alert|notice|verify|update)\b/i,
    type: 'Authority Impersonation',
    description: 'Impersonates a bank, government body, or authority to build false trust.',
    severity: 'high',
    weight: 35,
  },
  // Loan scam
  {
    id: 'instant_loan',
    regex: /\b(instant|immediate|quick|fast|easy|no.?document|no.?cibil|bad.?credit).{0,30}(loan|credit|finance|advance)\b/i,
    type: 'Fake Loan Offer',
    description: 'No-document or instant loan offers with no credit check are almost always scams.',
    severity: 'high',
    weight: 35,
  },
  {
    id: 'loan_fee',
    regex: /\b(processing fee|registration fee|security deposit|advance fee|gst|insurance).{0,30}(loan|credit|approve|disburse)\b/i,
    type: 'Loan Fee Fraud',
    description: 'Legitimate lenders deduct fees from the loan amount — they never ask you to pay upfront.',
    severity: 'high',
    weight: 40,
  },
  // Job scam
  {
    id: 'job_scam',
    regex: /\b(work from home|part.?time|earn \d+|₹\d+|rs\.?\s*\d+).{0,30}(daily|weekly|monthly|per (day|week|month|hour))\b/i,
    type: 'Fake Job / Income Offer',
    description: 'Unsolicited income offers are often task-based scams or money-mule recruitment.',
    severity: 'medium',
    weight: 25,
  },
  // Shortened URLs in text
  {
    id: 'short_url',
    regex: /\b(bit\.ly|tinyurl|t\.co|goo\.gl|ow\.ly|rb\.gy|cutt\.ly|short\.link|tiny\.cc|is\.gd)\b/i,
    type: 'Shortened URL',
    description: 'Contains a shortened URL that hides the real destination — a common phishing technique.',
    severity: 'medium',
    weight: 20,
  },
];

// ─── Link / URL Scam Patterns ────────────────────────────────────────────────

const TRUSTED_DOMAINS = new Set([
  'sbi.co.in', 'onlinesbi.com', 'hdfcbank.com', 'icicibank.com',
  'axisbank.com', 'kotak.com', 'pnbindia.in', 'yesbank.in',
  'npci.org.in', 'upi.one', 'bhimupi.org.in', 'rbi.org.in',
  'incometax.gov.in', 'irctc.co.in', 'uidai.gov.in',
  'google.com', 'apple.com', 'microsoft.com', 'amazon.in',
  'paytm.com', 'phonepe.com', 'gpay.app',
]);

interface LinkAnalysis {
  indicators: ScamIndicator[];
  score: number;
}

function analyzeLink(url: string): LinkAnalysis {
  const indicators: ScamIndicator[] = [];
  let score = 0;

  let parsed: URL | null = null;
  try {
    const normalized = url.startsWith('http') ? url : `http://${url}`;
    parsed = new URL(normalized);
  } catch {
    indicators.push({
      type: 'Invalid URL',
      description: 'The URL is malformed or cannot be parsed.',
      severity: 'medium',
    });
    score += 20;
    return { indicators, score };
  }

  const hostname = parsed.hostname.toLowerCase().replace(/^www\./, '');
  const fullUrl = url.toLowerCase();

  // Check against trusted domains
  const isTrusted = [...TRUSTED_DOMAINS].some(
    (d) => hostname === d || hostname.endsWith('.' + d)
  );

  // Homoglyph / typosquatting detection
  const typosquat = [
    { legit: 'sbi', pattern: /\bsb[il1|]\b|sbi[^\.]/i },
    { legit: 'hdfc', pattern: /hdf[ck](?!bank\.com)/i },
    { legit: 'rbi', pattern: /rb[il1]/i },
    { legit: 'paytm', pattern: /p[a@]ytm(?!\.com)/i },
    { legit: 'phonepe', pattern: /ph[o0]ne.?pe(?!\.com)/i },
  ];

  if (!isTrusted) {
    for (const ts of typosquat) {
      if (ts.pattern.test(hostname)) {
        indicators.push({
          type: 'Typosquatting',
          description: `Domain "${hostname}" appears to impersonate a legitimate service (${ts.legit}).`,
          severity: 'high',
          matchedText: hostname,
        });
        score += 40;
        break;
      }
    }
  }

  // Suspicious TLDs
  const suspiciousTLDs = ['.xyz', '.tk', '.ml', '.ga', '.cf', '.gq', '.buzz', '.click', '.link', '.top', '.ru', '.cn'];
  for (const tld of suspiciousTLDs) {
    if (hostname.endsWith(tld)) {
      indicators.push({
        type: 'Suspicious Domain Extension',
        description: `Domain ends with "${tld}" which is commonly used in phishing.`,
        severity: 'medium',
        matchedText: hostname,
      });
      score += 20;
      break;
    }
  }

  // IP address instead of domain
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) {
    indicators.push({
      type: 'IP Address URL',
      description: 'URL uses a raw IP address instead of a domain name — a strong phishing indicator.',
      severity: 'high',
      matchedText: hostname,
    });
    score += 40;
  }

  // HTTP (not HTTPS)
  if (parsed.protocol === 'http:') {
    indicators.push({
      type: 'No Encryption (HTTP)',
      description: 'Connection is not encrypted. Legitimate financial sites use HTTPS.',
      severity: 'medium',
    });
    score += 15;
  }

  // Suspicious keywords in URL path/query
  const scamKeywords = ['login', 'verify', 'account', 'secure', 'update', 'kyc', 'confirm', 'authenticate', 'otp', 'reward', 'prize', 'claim', 'win', 'cashback'];
  const matchedKW = scamKeywords.filter((kw) => fullUrl.includes(kw));
  if (matchedKW.length >= 2) {
    indicators.push({
      type: 'Phishing Keywords in URL',
      description: `URL contains suspicious keywords: ${matchedKW.slice(0, 3).join(', ')}.`,
      severity: 'high',
      matchedText: matchedKW.join(', '),
    });
    score += 30;
  } else if (matchedKW.length === 1) {
    indicators.push({
      type: 'Suspicious Keyword in URL',
      description: `URL contains the suspicious keyword "${matchedKW[0]}".`,
      severity: 'medium',
      matchedText: matchedKW[0],
    });
    score += 10;
  }

  // Very long URL
  if (url.length > 200) {
    indicators.push({
      type: 'Unusually Long URL',
      description: 'Very long URLs are often used to hide the real destination.',
      severity: 'low',
    });
    score += 10;
  }

  // Multiple subdomains
  const subdomainCount = hostname.split('.').length - 2;
  if (subdomainCount >= 3) {
    indicators.push({
      type: 'Excessive Subdomains',
      description: `URL has ${subdomainCount} subdomains — often used to mimic legitimate sites.`,
      severity: 'medium',
      matchedText: hostname,
    });
    score += 20;
  }

  // URL shorteners
  const shorteners = ['bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'ow.ly', 'rb.gy', 'cutt.ly', 'is.gd', 'tiny.cc'];
  if (shorteners.some((s) => hostname.includes(s))) {
    indicators.push({
      type: 'URL Shortener',
      description: 'Shortened URLs hide the true destination and are frequently used in phishing.',
      severity: 'medium',
    });
    score += 20;
  }

  // Trusted domain bonus
  if (isTrusted && indicators.length === 0) {
    // give a small base score but mark as likely safe
    score = Math.max(score, 5);
  }

  return { indicators, score };
}

// ─── Message Analysis ────────────────────────────────────────────────────────

function analyzeMessage(text: string): { indicators: ScamIndicator[]; score: number } {
  const indicators: ScamIndicator[] = [];
  let score = 0;

  for (const pattern of MESSAGE_PATTERNS) {
    const match = text.match(pattern.regex);
    if (match) {
      // Avoid duplicate type entries
      if (!indicators.find((i) => i.type === pattern.type)) {
        indicators.push({
          type: pattern.type,
          description: pattern.description,
          severity: pattern.severity,
          matchedText: match[0],
        });
        score += pattern.weight;
      }
    }
  }

  // Check for any embedded URLs in the message
  const urlMatch = text.match(/https?:\/\/[^\s]+|www\.[^\s]+/gi);
  if (urlMatch) {
    for (const url of urlMatch.slice(0, 2)) {
      const linkResult = analyzeLink(url);
      for (const ind of linkResult.indicators) {
        if (!indicators.find((i) => i.type === ind.type)) {
          indicators.push(ind);
          score += Math.round(linkResult.score * 0.5); // partial weight for embedded link
        }
      }
    }
  }

  return { indicators, score };
}

// ─── Risk Level & Recommendations ───────────────────────────────────────────

function getRiskLevel(score: number): RiskLevel {
  if (score <= 20) return 'low';
  if (score <= 55) return 'medium';
  return 'high';
}

function getExplanation(type: ScanType, riskLevel: RiskLevel, indicators: ScamIndicator[]): string {
  if (indicators.length === 0) {
    return type === 'message'
      ? 'No obvious scam patterns were detected in this message. However, always remain vigilant — scammers constantly evolve their tactics.'
      : 'No obvious phishing indicators were detected in this URL. Always verify the domain carefully before entering any personal information.';
  }

  const topIndicators = indicators
    .sort((a, b) => (b.severity === 'high' ? 1 : 0) - (a.severity === 'high' ? 1 : 0))
    .slice(0, 3)
    .map((i) => i.type)
    .join(', ');

  const levelText =
    riskLevel === 'high'
      ? 'This is highly suspicious and likely a scam.'
      : riskLevel === 'medium'
      ? 'This shows several warning signs and should be treated with caution.'
      : 'This shows minor indicators. Proceed carefully.';

  return `${levelText} Key red flags detected: ${topIndicators}. ${
    type === 'message'
      ? 'Legitimate institutions never ask for OTPs, passwords, or advance payments via SMS.'
      : 'Verify the URL carefully and never enter sensitive data on unverified sites.'
  }`;
}

function getRecommendations(riskLevel: RiskLevel, indicators: ScamIndicator[], type: ScanType): string[] {
  const base = [
    'Never share OTPs, passwords or PINs with anyone.',
    'When in doubt, call the institution\'s official number.',
  ];

  if (riskLevel === 'low') {
    return [
      ...base,
      'Stay aware — scam messages may appear legitimate at first glance.',
    ];
  }

  const recs: string[] = [];

  const types = indicators.map((i) => i.type);

  if (types.some((t) => t.includes('OTP'))) {
    recs.push('Do NOT share your OTP with anyone — not even bank officials.');
  }
  if (types.some((t) => t.includes('Loan'))) {
    recs.push('Legitimate lenders never charge upfront fees. Verify the lender on RBI\'s website.');
  }
  if (types.some((t) => t.includes('Investment') || t.includes('Return'))) {
    recs.push('Check investment firms on SEBI\'s registered intermediary portal before investing.');
  }
  if (types.some((t) => t.includes('UPI'))) {
    recs.push('Accept UPI collect requests ONLY from known contacts. You can never receive money by approving a request.');
  }
  if (types.some((t) => t.includes('Impersonation') || t.includes('Authority'))) {
    recs.push('Government agencies do NOT contact you via SMS to collect fees or fines. Verify via official portals.');
  }
  if (types.some((t) => t.includes('Link') || t.includes('URL') || t.includes('Phishing'))) {
    recs.push('Do NOT click any link. Manually type the official website address in your browser.');
  }
  if (type === 'link') {
    recs.push('Report the URL to the National Cyber Crime Reporting Portal: cybercrime.gov.in');
  }

  return [...recs, ...base].slice(0, 5);
}

// ─── Main Public API ─────────────────────────────────────────────────────────

export function scanMessage(text: string): ScanResult {
  const { indicators, score } = analyzeMessage(text);
  const clampedScore = Math.min(100, score);
  const riskLevel = getRiskLevel(clampedScore);

  return {
    id: generateId(),
    type: 'message',
    input: text.slice(0, 500),
    riskScore: clampedScore,
    riskLevel,
    indicators,
    explanation: getExplanation('message', riskLevel, indicators),
    recommendations: getRecommendations(riskLevel, indicators, 'message'),
    analyzedBy: 'local',
    timestamp: Date.now(),
  };
}

export function scanLink(url: string): ScanResult {
  const { indicators, score } = analyzeLink(url.trim());
  const clampedScore = Math.min(100, score);
  const riskLevel = getRiskLevel(clampedScore);

  return {
    id: generateId(),
    type: 'link',
    input: url.trim(),
    riskScore: clampedScore,
    riskLevel,
    indicators,
    explanation: getExplanation('link', riskLevel, indicators),
    recommendations: getRecommendations(riskLevel, indicators, 'link'),
    analyzedBy: 'local',
    timestamp: Date.now(),
  };
}
