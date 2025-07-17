import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface FormData {
  email: string;
  password: string;
}

// Reusable class names to DRY up typography
const headingClass = "text-2xl font-extrabold text-[var(--color-charcoal-100)]";
const labelClass = "block mb-1 text-sm font-medium text-[var(--color-charcoal-300)]";
const errorInputClass = "border-red-500 focus-visible:ring-red-200";

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({ email: "", password: "" });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [loading, setLoading] = useState(false);
  const [verifiedMsg, setVerifiedMsg] = useState<string | null>(null);

  // read ?verified=1 or error
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const v = params.get('verified');
    if (v === '1') {
      setVerifiedMsg('Your email has been verified. Please sign in.');
    } else if (v === '0') {
      const err = params.get('error');
      setVerifiedMsg(err === 'token' ? 'Verification link expired or invalid.' : 'Unable to verify email.');
    }
  }, []);

  const validate = (): boolean => {
    const newErrors: Partial<FormData> = {};
    if (!formData.email) newErrors.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Please enter a valid email.";
    if (!formData.password) newErrors.password = "Password is required.";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      // TODO: replace with real API call
      await new Promise(res => setTimeout(res, 1000));
      // handle successful login
    } catch (err) {
      // TODO: handle API errors (e.g. set form-level error)
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--color-ash_gray-500)] text-[var(--color-dark_slate_gray-900)] flex items-center justify-center">
      <Card className="w-full max-w-md p-6 bg-[var(--color-white)] dark:bg-[var(--color-dark_slate_gray-900)] shadow-xl rounded-2xl transition-shadow hover:shadow-[0_8px_24px_-4px_rgba(82,121,111,0.1)]">
        <CardHeader className="text-center">
          <CardTitle className={headingClass}>Login</CardTitle>
          <p className="text-sm text-[var(--color-charcoal-200)]">
            Enter your email below to login to your account
          </p>
          {verifiedMsg && (
            <div className="mt-3 p-2 text-sm rounded-md bg-green-100 text-green-700" role="status">
              {verifiedMsg}
            </div>
          )}
        </CardHeader>

        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
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
                className={`focus-visible:ring-2 focus-visible:ring-[var(--color-cambridge_blue-500)]/50 ${errors.email ? errorInputClass : ""}`}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600" role="alert">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className={labelClass}>
                  Password
                </label>
                <a
                  href="#"
                  className="text-sm text-[var(--color-cambridge_blue-600)] hover:text-[var(--color-cambridge_blue-500)] transition-colors"
                >
                  Forgot password?
                </a>
              </div>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                aria-invalid={!!errors.password}
                className={`focus-visible:ring-2 focus-visible:ring-[var(--color-cambridge_blue-500)]/50 ${errors.password ? errorInputClass : ""}`}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600" role="alert">
                  {errors.password}
                </p>
              )}
            </div>

            {/* CTA */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-[var(--color-cambridge_blue-500)] hover:bg-[var(--color-cambridge_blue-600)] focus-visible:ring-2 focus-visible:ring-[var(--color-cambridge_blue-400)] disabled:opacity-50"
            >
              {loading ? "Signing In..." : "Sign In"}
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

          {/* Sign-up link */}
          <div className="mt-4 text-center text-sm text-[var(--color-charcoal-300)]">
            Don't have an account?{' '}
            <a
              href="#"
              className="text-[var(--color-cambridge_blue-600)] hover:text-[var(--color-cambridge_blue-500)] transition-colors"
            >
              Sign up
            </a>
          </div>
        </CardContent>
      </Card>
    </main>
  );
};

export default LoginPage;
