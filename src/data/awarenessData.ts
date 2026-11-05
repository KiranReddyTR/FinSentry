import { AwarenessCategory } from '../types';

export const AWARENESS_CATEGORIES: AwarenessCategory[] = [
  {
    id: 'upi',
    title: 'UPI Scams',
    icon: 'phone-portrait-outline',
    color: '#00d4aa',
    description:
      'UPI (Unified Payments Interface) scams involve fraudsters manipulating you into approving payment requests or revealing your UPI PIN.',
    tips: [
      'You NEVER need to enter your UPI PIN to RECEIVE money.',
      'A "collect" request is a payment request — approving it sends money FROM you.',
      'Verify the payee\'s UPI ID carefully before confirming any transaction.',
      'Enable transaction limits and SMS alerts on your UPI app.',
      'Never scan a QR code sent by a stranger to "receive" a refund.',
    ],
    redFlags: [
      'Someone asks you to approve a "collect" request to receive money.',
      'You receive a QR code along with a promise of a refund or cashback.',
      'An unknown caller asks for your UPI PIN over the phone.',
      'You receive a payment request from an unknown UPI ID.',
    ],
  },
  {
    id: 'otp',
    title: 'OTP Fraud',
    icon: 'keypad-outline',
    color: '#ffa502',
    description:
      'OTP fraud involves criminals tricking you into sharing the One-Time Password sent to your phone, enabling them to access your accounts or authorize transactions.',
    tips: [
      'No bank, government body, or company ever needs your OTP — not even to "verify your account".',
      'OTPs are valid for only 30–60 seconds; never share one.',
      'If you receive an unsolicited OTP, change your passwords immediately.',
      'Enable SIM-swap protection with your telecom provider.',
      'Report suspicious OTP calls to your bank immediately.',
    ],
    redFlags: [
      'A caller claims to be from your bank and asks for "the OTP sent to your phone".',
      'You receive an OTP you did not request.',
      'Someone says they need your OTP to process a refund or reward.',
      'An OTP arrives right after a call from an "RBI officer" or "bank executive".',
    ],
  },
  {
    id: 'investment',
    title: 'Fake Investment Schemes',
    icon: 'trending-up-outline',
    color: '#ff4757',
    description:
      'Fraudulent investment schemes promise high, guaranteed returns through stocks, crypto, forex, or "exclusive" platforms, often structured as Ponzi or pyramid schemes.',
    tips: [
      'No legitimate investment guarantees returns — all investments carry risk.',
      'Verify investment advisors and firms on the SEBI SCORES portal.',
      'Be very skeptical of returns exceeding 15–20% per year.',
      'Avoid investments promoted via WhatsApp or Telegram groups.',
      'Research the company, its directors, and regulatory registration thoroughly.',
    ],
    redFlags: [
      'Promises of 30%, 50%, or 100% returns with zero risk.',
      'Pressure to invest quickly before the "opportunity closes".',
      'Recruitment model where you earn by bringing in new investors.',
      'No clear business model explaining how returns are generated.',
      'Unofficial trading app not listed on official app stores.',
    ],
  },
  {
    id: 'loan',
    title: 'Loan Fraud',
    icon: 'cash-outline',
    color: '#a855f7',
    description:
      'Fake lenders target people with poor credit or urgent cash needs, offering "guaranteed" loans but demanding upfront fees that they pocket while never disbursing the loan.',
    tips: [
      'Legitimate lenders deduct processing fees from the loan amount — never upfront.',
      'Verify NBFC/lender registration on the RBI website before applying.',
      'Never pay "insurance", "GST", or "processing fees" before a loan is disbursed.',
      'Check the lender\'s physical address and customer care number independently.',
      'Avoid apps not listed on the official Google Play Store or Apple App Store.',
    ],
    redFlags: [
      'Loan approval despite bad credit with no documents needed.',
      'Request for an upfront "processing fee", "security deposit" or "insurance".',
      'Loan approved instantly within minutes via WhatsApp or SMS.',
      'No physical office address or verifiable contact information.',
      'Agent pressures you to transfer money quickly to "unlock" the loan.',
    ],
  },
  {
    id: 'phishing',
    title: 'Phishing Attacks',
    icon: 'fish-outline',
    color: '#00bcd4',
    description:
      'Phishing uses deceptive emails, SMS (smishing), or fake websites that impersonate trusted brands to steal login credentials, card details, or personal information.',
    tips: [
      'Always check the full URL before entering credentials — look for subtle misspellings.',
      'Access banking or financial sites by typing the URL directly, never via links.',
      'Look for HTTPS and the padlock icon — but note these alone don\'t guarantee legitimacy.',
      'Enable two-factor authentication on all financial accounts.',
      'Report phishing to the CERT-In portal: https://www.cert-in.org.in',
    ],
    redFlags: [
      'Email or SMS with a link to "verify your account" or "update KYC".',
      'URL contains your bank\'s name but with extra characters (e.g., "sbi-secure-login.xyz").',
      'Page looks identical to your bank\'s site but the URL is different.',
      'Urgency language: "Your account will be blocked in 24 hours".',
      'Form asks for both your username AND password on a single page.',
    ],
  },
  {
    id: 'impersonation',
    title: 'Impersonation Scams',
    icon: 'person-remove-outline',
    color: '#3b82f6',
    description:
      'Scammers impersonate government officials (RBI, CBI, Income Tax), police, bank employees, or even family members to intimidate you into transferring money or sharing sensitive data.',
    tips: [
      'Government agencies do NOT arrest people or impose fines via phone calls.',
      'Hang up and call the official number of the institution to verify any claim.',
      'Real RBI officers never contact individuals to ask for money or OTPs.',
      'Verify any "family emergency" call by calling the family member directly.',
      'Do not make "safe account" transfers at the request of any caller.',
    ],
    redFlags: [
      'Caller claims to be from RBI/CBI/Police and threatens arrest unless you pay.',
      'Officer asks you to transfer funds to a "safe account" they provide.',
      'Caller knows your partial account number or Aadhaar and uses it to seem legitimate.',
      '"Your parcel has been seized by customs — pay a fee to release it."',
      'Caller tells you not to tell your family about this conversation.',
    ],
  },
];
