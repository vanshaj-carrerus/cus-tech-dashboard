"use client";

import { useState, useEffect } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";

interface LoginFormProps {
  onLoginSuccess: () => void;
}

export function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Get the password from environment variable
    const correctPassword = process.env.NEXT_PUBLIC_DASHBOARD_PASSWORD;

    if (!password) {
      setError("Please enter a password");
      setLoading(false);
      return;
    }

    // Check password
    if (password === correctPassword) {
      // Store in localStorage that user is authenticated
      localStorage.setItem("dashboardAuth", "true");
      localStorage.setItem("authTimestamp", new Date().getTime().toString());
      onLoginSuccess();
    } else {
      setError("❌ Incorrect password. Try again.");
      setPassword("");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center px-3 md:px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-2xl p-6 md:p-12">
          {/* Header */}
          <div className="text-center mb-6 md:mb-8">
            <div className="inline-flex items-center justify-center w-12 md:w-16 h-12 md:h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full mb-3 md:mb-4 shadow-lg">
              <Lock className="w-6 md:w-8 h-6 md:h-8 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 text-xs md:text-sm mt-2">Enter password to continue</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-3 md:space-y-5">
            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter dashboard password"
                  className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400 text-sm md:text-base"
                  disabled={loading}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 md:w-5 h-4 md:h-5" />
                  ) : (
                    <Eye className="w-4 md:w-5 h-4 md:h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-2 md:p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs md:text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 md:py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm md:text-base font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {loading ? "Checking..." : "Unlock Dashboard"}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              🔐 Your dashboard is password protected
            </p>
          </div>
        </div>

        {/* Info Card */}
        <div className="mt-4 md:mt-6 bg-white/10 backdrop-blur border border-white/20 rounded-lg p-3 md:p-4">
          <p className="text-xs md:text-sm text-gray-300 text-center">
            👋 Welcome to the Recruitment Team Dashboard
          </p>
        </div>
      </div>
    </div>
  );
}
