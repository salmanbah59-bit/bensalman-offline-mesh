// AES-256 E2E Simulation for BENSALMAN Mesh packets

export function encryptPayload(plain: string, sender: string, target: string): string {
  // Simulates AES-256 CBC with deterministic salt and random IV
  const iv = Math.random().toString(36).substring(2, 10);
  const encoded = btoa(unescape(encodeURIComponent(plain)));
  return `AES256:${iv}:${encoded}`;
}

export function decryptPayload(cipher: string): string | null {
  try {
    if (!cipher.startsWith('AES256:')) return cipher;
    const parts = cipher.split(':');
    if (parts.length < 3) return null;
    const base64 = parts[2];
    return decodeURIComponent(escape(atob(base64)));
  } catch {
    return null;
  }
}
