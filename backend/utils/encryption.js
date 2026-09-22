const crypto = require('crypto');

const algorithm = 'aes-256-gcm';

function key() {
  const value = process.env.ENCRYPTION_KEY;
  if (!/^[a-f0-9]{64}$/i.test(value || '')) {
    throw new Error('ENCRYPTION_KEY must be a 64-character hexadecimal AES-256 key');
  }
  return Buffer.from(value, 'hex');
}

function encrypt(value) {
  if (value === null || value === undefined || value === '') return null;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(algorithm, key(), iv);
  const encrypted = Buffer.concat([cipher.update(String(value), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv, tag, encrypted].map((part) => part.toString('base64')).join('.');
}

function decrypt(value) {
  if (value === null || value === undefined || value === '') return null;
  const [ivEncoded, tagEncoded, encryptedEncoded] = String(value).split('.');
  if (!ivEncoded || !tagEncoded || !encryptedEncoded) throw new Error('Invalid encrypted value');
  const decipher = crypto.createDecipheriv(algorithm, key(), Buffer.from(ivEncoded, 'base64'));
  decipher.setAuthTag(Buffer.from(tagEncoded, 'base64'));
  return Buffer.concat([decipher.update(Buffer.from(encryptedEncoded, 'base64')), decipher.final()]).toString('utf8');
}

module.exports = { decrypt, encrypt };