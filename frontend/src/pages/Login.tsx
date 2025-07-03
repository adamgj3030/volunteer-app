import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md p-6 shadow-xl rounded-2xl transition-shadow hover:shadow-[0_8px_24px_-4px_rgba(132,169,140,0.10)]">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Login</CardTitle>
          <p className="text-sm text-gray-500">
            Enter your email below to login to your account
          </p>
        </CardHeader>

        <CardContent>
          <form className="space-y-4">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block mb-1 text-sm font-medium text-left"
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="focus-visible:ring-2 focus-visible:ring-cambridge_blue-500/50"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block mb-1 text-sm font-medium"
                >
                  Password
                </label>
                <a
                  href="#"
                  className="text-sm text-cambridge_blue-600 hover:text-cambridge_blue-500 transition-colors"
                >
                  Forgot password?
                </a>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="focus-visible:ring-2 focus-visible:ring-cambridge_blue-500/50"
              />
            </div>

            {/* CTA */}
            <Button
              type="submit"
              className="w-full mt-4 bg-cambridge_blue-500 hover:bg-cambridge_blue-600 focus-visible:ring-2 focus-visible:ring-cambridge_blue-400"
            >
              Sign In
            </Button>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-ash_gray-400/40" />
              </div>
              <div className="relative flex justify-center text-sm">
                {/* You can put “or continue with” here later if you add OAuth */}
              </div>
            </div>
          </form>

          {/* Sign-up link */}
          <div className="mt-4 text-center text-sm">
            Don't have an account?{" "}
            <a
              href="#"
              className="text-cambridge_blue-600 hover:text-cambridge_blue-500 transition-colors"
            >
              Sign up
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
