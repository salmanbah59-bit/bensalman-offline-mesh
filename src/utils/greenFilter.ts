// BENSALMAN Green Content Charter offline validator

const BLACKLIST = [
  'profanity',
  'curse',
  'swear',
  'toxic',
  'hate',
  'vulgar',
  'abuse',
  'nude',
  'nsfw',
  'porn',
  'scam',
  'fraud',
  'drugs',
  'weapon',
  'kill',
  'idiot',
  'stupid',
  'trash',
  'attack',
  'shame',
];

export interface GreenValidationResult {
  isValid: boolean;
  violationReason?: string;
  matchedWord?: string;
}

export function validateGreenContent(text: string): GreenValidationResult {
  if (!text || text.trim() === '') {
    return { isValid: true };
  }

  const normalized = text.toLowerCase();

  for (const word of BLACKLIST) {
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    if (regex.test(normalized) || normalized.includes(word)) {
      return {
        isValid: false,
        matchedWord: word,
        violationReason: `Content violates Green Content Charter: detected prohibited term "${word}". BENSALMAN is strictly family-safe.`,
      };
    }
  }

  return { isValid: true };
}

export function sanitizeGreenContent(text: string): string {
  let clean = text;
  for (const word of BLACKLIST) {
    const regex = new RegExp(word, 'gi');
    clean = clean.replace(regex, '🌿[GREEN MASKED]🌿');
  }
  return clean;
}
