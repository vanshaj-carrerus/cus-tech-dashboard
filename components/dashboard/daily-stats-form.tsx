"use client";

import { useState } from "react";
import { Send, Loader } from "lucide-react";

interface DailyStatsFormProps {
  onSuccess?: () => void;
}

export function DailyStatsForm({ onSuccess }: DailyStatsFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    teamMemberName: "",
    applicationsCount: "",
    interviewsCount: "",
    reachOutsCount: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validation
    if (!formData.teamMemberName.trim()) {
      setError("Name is required");
      return;
    }

    if (
      !formData.applicationsCount ||
      !formData.interviewsCount ||
      !formData.reachOutsCount
    ) {
      setError("All counts are required");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/daily-stats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teamMemberName: formData.teamMemberName,
          applicationsCount: parseInt(formData.applicationsCount),
          interviewsCount: parseInt(formData.interviewsCount),
          reachOutsCount: parseInt(formData.reachOutsCount),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to submit stats");
      }

      setSuccess(true);
      setFormData({
        teamMemberName: "",
        applicationsCount: "",
        interviewsCount: "",
        reachOutsCount: "",
      });

      // Auto-hide success message
      setTimeout(() => {
        setSuccess(false);
        onSuccess?.();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">
        Log Your Daily Activity
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-sm text-green-700">
          ✓ Daily stats submitted successfully!
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Name Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Name *
          </label>
          <input
            type="text"
            name="teamMemberName"
            value={formData.teamMemberName}
            onChange={handleChange}
            placeholder="e.g., John Doe"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm text-gray-900"
            disabled={loading}
          />
        </div>

        {/* Applications Count */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Applications Done Today *
          </label>
          <input
            type="number"
            name="applicationsCount"
            value={formData.applicationsCount}
            onChange={handleChange}
            placeholder="0"
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm text-gray-900"
            disabled={loading}
          />
        </div>

        {/* Interviews Count */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Interviews Conducted Today *
          </label>
          <input
            type="number"
            name="interviewsCount"
            value={formData.interviewsCount}
            onChange={handleChange}
            placeholder="0"
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm text-gray-900"
            disabled={loading}
          />
        </div>

        {/* Reach Outs Count */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reach Outs Conducted Today *
          </label>
          <input
            type="number"
            name="reachOutsCount"
            value={formData.reachOutsCount}
            onChange={handleChange}
            placeholder="0"
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm text-gray-900"
            disabled={loading}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader className="w-4 h-4 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            Submit Daily Stats
          </>
        )}
      </button>
    </form>
  );
}
