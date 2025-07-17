import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  role: 'volunteer' | 'admin' | '';
}

const headingClass = 'text-2xl font-extrabold text-[var(--color-charcoal-100)]';
const labelClass = 'block mb-1 text-sm font-medium text-[var(--color-charcoal-300)]';
const errorInputClass = 'border-red-500 focus-visible:ring-red-200';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [loading, setLoading] = useState(false);

  const validate = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email.';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Minimum length is 6 characters.';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password.';
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    if (!formData.role) {
      newErrors.role = 'Please select a role.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    if (errors[id as keyof FormData]) {
      setErrors(prev => ({ ...prev, [id]: undefined }));
    }
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id } = e.target;
    setFormData(prev => ({
      ...prev,
      role: prev.role === id ? '' : (id as 'volunteer' | 'admin'),
    }));
    if (errors.role) {
      setErrors(prev => ({ ...prev, role: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      // TODO: hook up to your /api/register
      await new Promise(res => setTimeout(res, 1000));
      // handle successful registration (e.g., redirect to login)
    } catch (err) {
      // TODO: handle API errors (e.g., set form-level error)
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--color-ash_gray-500)] text-[var(--color-dark_slate_gray-900)] flex items-center justify-center">
      <Card className="w-full max-w-md p-6 bg-[var(--color-white)] dark:bg-[var(--color-dark_slate_gray-900)] shadow-xl rounded-2xl transition-shadow hover:shadow-[0_8px_24px_-4px_rgba(82,121,111,0.1)]">
        <CardHeader className="text-center">
          <CardTitle className={headingClass}>Register</CardTitle>
          <p className="text-sm text-[var(--color-charcoal-200)]">
            Enter your email and password to create an account
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className={labelClass}>
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                aria-invalid={!!errors.email}
                className={`focus-visible:ring-2 focus-visible:ring-[var(--color-cambridge_blue-500)]/50 ${
                  errors.email ? errorInputClass : ''
                }`}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600" role="alert">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className={labelClass}>
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                aria-invalid={!!errors.password}
                className={`focus-visible:ring-2 focus-visible:ring-[var(--color-cambridge_blue-500)]/50 ${
                  errors.password ? errorInputClass : ''
                }`}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600" role="alert">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className={labelClass}>
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                aria-invalid={!!errors.confirmPassword}
                className={`focus-visible:ring-2 focus-visible:ring-[var(--color-cambridge_blue-500)]/50 ${
                  errors.confirmPassword ? errorInputClass : ''
                }`}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600" role="alert">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Role Selection */}
            <div>
              <span className={labelClass}>Role</span>
              <div className="flex items-center space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    id="volunteer"
                    checked={formData.role === 'volunteer'}
                    onChange={handleRoleChange}
                    className="mr-2"
                  />
                  Volunteer
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    id="admin"
                    checked={formData.role === 'admin'}
                    onChange={handleRoleChange}
                    className="mr-2"
                  />
                  Admin
                </label>
              </div>
              {errors.role && (
                <p className="mt-1 text-sm text-red-600" role="alert">
                  {errors.role}
                </p>
              )}
            </div>

            {/* CTA */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-[var(--color-cambridge_blue-500)] hover:bg-[var(--color-cambridge_blue-600)] focus-visible:ring-2 focus-visible:ring-[var(--color-cambridge_blue-400)] disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Register'}
            </Button>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-[var(--color-ash_gray-400)]/40" />
              </div>
              <div className="relative flex justify-center text-sm text-[var(--color-charcoal-300)]">
                {/* Or continue with OAuth */}
              </div>
            </div>
          </form>

          {/* Sign-in link */}
          <div className="mt-4 text-center text-sm text-[var(--color-charcoal-300)]">
            Already have an account?{' '}
            <a
              href="/login"
              className="text-[var(--color-cambridge_blue-600)] hover:text-[var(--color-cambridge_blue-500)] transition-colors"
            >
              Log in
            </a>
          </div>
        </CardContent>
      </Card>
    </main>
  );
};

export default RegisterPage;
