const validator = require('validator');

function passwordPolicyError(password, name, email, subject = 'your') {
  if (password.length < 8) return 'Password must be at least 8 characters.';
  const normalizedPassword = password.toLowerCase();
  const emailLocalPart = email.split('@')[0].toLowerCase();
  if ((name && normalizedPassword.includes(name.trim().toLowerCase())) ||
      (emailLocalPart && normalizedPassword.includes(emailLocalPart))) {
    return `Password must not contain ${subject} name or email username.`;
  }
  return null;
}

function cleanName(value) {
  return validator.escape(value.trim());
}

function cleanText(value) {
  return value === undefined || value === null ? null : validator.escape(String(value).trim());
}

module.exports = { cleanName, cleanText, passwordPolicyError };