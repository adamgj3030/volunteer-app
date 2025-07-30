import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useAuth } from '@/context/AuthContext';
import { resendConfirmation } from '@/lib/api';

interface FormData {
  email: string;
  password: string;
}

const headingClass = "text-2xl font-extrabold text-[var(--color-charcoal-100)]";
const labelClass = "block mb-1 text-sm font-medium text-[var(--color-charcoal-300)]";
const errorInputClass = "border-red-500 focus-visible:ring-red-200";

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({ email: "", password: "" });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [loading, setLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState<string | null>(null);
  const [alertType, setAlertType] = useState<'success'|'error'|'info'|null>(null);

  const { login, user } = useAuth();
  const navigate = useNavigate();

  // if already logged in, push by role immediately ----------------------
  useEffect(() => {
    if (!user) return;
    if (user.role === 'ADMIN') navigate('/admin');
    else if (user.role === 'VOLUNTEER') navigate('/volunteer');
    else navigate('/admin/approval');
  }, [user, navigate]);

  // read ?verified=1 or error
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const v = params.get('verified');
    if (v === '1') {
      setAlertMsg('Your email has been verified. Please sign in.');
      setAlertType('success');
    } else if (v === '0') {
      const err = params.get('error');
      setAlertMsg(err === 'token' ? 'Verification link expired or invalid.' : 'Unable to verify email.');
      setAlertType('error');
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

  const handleResend = async () => {
    try {
      await resendConfirmation(formData.email);
      setAlertMsg('If the email is registered and unconfirmed, a new confirmation link has been sent.');
      setAlertType('info');
    } catch {
      setAlertMsg('Unable to resend confirmation email.');
      setAlertType('error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const { redirect } = await login(formData.email, formData.password);
      navigate(redirect ?? '/');
    } catch (err: any) {
      const code = err?.code;
      if (code === 'email_unconfirmed') {
        setAlertMsg(err?.message || 'Please confirm your email.');
        setAlertType('error');
      } else if (code === 'admin_pending') {
        setAlertMsg(err?.message || 'Your admin account is still pending approval.')
        setAlertType('info')
      } else if (code === 'invalid_login') {
        setAlertMsg('Invalid email or password.');
        setAlertType('error');
      } else {
        setAlertMsg('Login failed. Please try again.');
        setAlertType('error');
      }
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
          {alertMsg && (
            <div className={`mt-3 p-2 text-sm rounded-md ${alertType==='success'?'bg-green-100 text-green-700':alertType==='error'?'bg-red-100 text-red-700':'bg-blue-100 text-blue-700'}`} role="status">
              {alertMsg}
              {alertType==='error' && formData.email && (
                <button type="button" onClick={handleResend} className="ml-2 underline text-xs">Resend confirmation</button>
              )}
            </div>
          )}
        </CardHeader>

        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <div>
              <label htmlFor="email" className={labelClass}>Email</label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                aria-invalid={!!errors.email}
                className={`focus-visible:ring-2 focus-visible:ring-[var(--color-cambridge_blue-500)]/50 ${errors.email ? errorInputClass : ""}`}
              />
              {errors.email && (<p className="mt-1 text-sm text-red-600" role="alert">{errors.email}</p>)}
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className={labelClass}>Password</label>
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
              {errors.password && (<p className="mt-1 text-sm text-red-600" role="alert">{errors.password}</p>)}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-[var(--color-cambridge_blue-500)] hover:bg-[var(--color-cambridge_blue-600)] focus-visible:ring-2 focus-visible:ring-[var(--color-cambridge_blue-400)] disabled:opacity-50"
            >
              {loading ? "Signing In..." : "Sign In"}
            </Button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-[var(--color-ash_gray-400)]/40" />
              </div>
              <div className="relative flex justify-center text-sm text-[var(--color-charcoal-300)]"></div>
            </div>
          </form>

          <div className="mt-4 text-center text-sm text-[var(--color-charcoal-300)]">
            Don't have an account?{' '}
            <a href="/register" className="text-[var(--color-cambridge_blue-600)] hover:text-[var(--color-cambridge_blue-500)] transition-colors">Sign up</a>
          </div>
        </CardContent>
      </Card>
    </main>
  );
};

export default LoginPage;