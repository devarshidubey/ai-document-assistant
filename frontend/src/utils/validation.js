const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[ !"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~])[A-Za-z\d !"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]{8,}$/;

export const validateEmail = (email) => {
  if (!email?.trim()) return 'Email is required';
  if (!EMAIL_REGEX.test(email.trim())) return 'Enter a valid email address';
  return null;
};

export const validatePassword = (password, { forSignup = false } = {}) => {
  if (!password) return 'Password is required';
  if (forSignup && !PASSWORD_REGEX.test(password)) {
    return 'Password must be 8+ chars with upper, lower, number, and special character';
  }
  return null;
};

export const validateWorkspaceName = (name) => {
  if (!name?.trim()) return 'Workspace name is required';
  if (name.trim().length > 100) return 'Workspace name must be 100 characters or fewer';
  return null;
};

export const ALLOWED_FILE_TYPES = ['application/pdf', 'text/markdown', 'text/x-markdown'];
export const ALLOWED_EXTENSIONS = ['.pdf', '.md'];

export const validateDocumentFile = (file) => {
  if (!file) return 'Please select a file';
  const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext) && !ALLOWED_FILE_TYPES.includes(file.type)) {
    return 'Only .pdf and .md files are supported';
  }
  if (file.size > 10 * 1024 * 1024) return 'File must be 10 MB or smaller';
  return null;
};
