const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

export const SHORT_ID_LENGTH = 6;

export const generateShortId = (): string => {
  const bytes = crypto.getRandomValues(new Uint8Array(SHORT_ID_LENGTH));
  return Array.from(bytes, (byte) => ALPHABET[byte % ALPHABET.length]).join('');
};
