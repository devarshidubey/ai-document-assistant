import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { validateEmail, validatePassword } from '../../utils/validation';
import Input from '../ui/Input';
import Button from '../ui/Button';
import AlertBanner from '../ui/AlertBanner';
import ThemeToggle from '../ui/ThemeToggle';

export default function SignUpForm() {
  const navigate = useNavigate();
  const { signup, login, loading, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setSuccess(false);

    const errors = {
      email: validateEmail(email),
      password: validatePassword(password, { forSignup: true }),
    };
    setFieldErrors(errors);
    if (errors.email || errors.password) return;

    try {
      await signup({ email: email.trim(), password });
      setSuccess(true);
      await login({ email: email.trim(), password });
      navigate('/', { replace: true });
    } catch {
      // error surfaced via context
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-surface-muted">
      <div className="flex justify-end p-4">
        <ThemeToggle />
      </div>

      <div className="flex flex-1 items-center justify-center px-4 pb-16">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent-muted">
              <FileText className="h-6 w-6 text-accent" />
            </div>
            <h1 className="text-2xl font-bold text-text">Create an account</h1>
            <p className="mt-1 text-sm text-text-muted">
              Start building your AI-powered document workspace
            </p>
          </div>

          <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
            {error && (
              <div className="mb-4">
                <AlertBanner message={error} onDismiss={clearError} />
              </div>
            )}
            {success && (
              <div className="mb-4">
                <AlertBanner
                  message="Account created! Signing you in..."
                  variant="success"
                />
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <Input
                label="Email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={fieldErrors.email}
                placeholder="you@example.com"
              />
              <Input
                label="Password"
                name="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={fieldErrors.password}
                placeholder="Strong password required"
              />
              <p className="text-xs text-text-muted">
                Must include uppercase, lowercase, number, and special character (8+ chars).
              </p>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creating account...' : 'Sign up'}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-text-muted">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-accent hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
