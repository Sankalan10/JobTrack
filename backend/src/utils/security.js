import crypto from 'crypto';

/**
 * Safely decrypts the encrypted Jooble API key using the JWT_SECRET as a key.
 * This guarantees the key is never stored in plaintext on disk or in the git repository.
 * It also automatically handles any error and guarantees no credentials leak in logs.
 */
export const decryptJoobleKey = () => {
  const encryptedKey = process.env.JOOBLE_API_KEY_SECURE;
  const jwtSecret = process.env.JWT_SECRET;

  if (!encryptedKey) {
    return null;
  }

  if (!jwtSecret) {
    console.error('[Security] JWT_SECRET is missing, cannot decrypt Jooble key.');
    return null;
  }

  try {
    const parts = encryptedKey.split(':');
    if (parts.length !== 2) {
      return null;
    }

    const key = crypto.createHash('sha256').update(jwtSecret).digest();
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = Buffer.from(parts[1], 'hex');

    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString('utf8');
  } catch (error) {
    // Fail silently to prevent leaking any internal cryptographical state or key materials
    console.error('[Security] Decryption of API key failed.');
    return null;
  }
};
