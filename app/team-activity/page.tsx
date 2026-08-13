"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/header";
import { DailyStatsForm } from "@/components/dashboard/daily-stats-form";
import { TeamStats } from "@/components/dashboard/team-stats";

export default function TeamActivityPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleStatsSubmitted = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Team Activity Tracker</h2>
              <p className="text-sm text-gray-500 mt-1">
                Log your daily recruitment metrics - applications, interviews, and reach outs
              </p>
            </div>
            <button
              onClick={() => setRefreshKey((prev) => prev + 1)}
              className="p-2 hover:bg-white rounded-lg transition-colors border border-gray-200"
              title="Refresh data"
            >
              <RefreshCw className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Form Section */}
        <div className="mb-8">
          <DailyStatsForm onSuccess={handleStatsSubmitted} />
        </div>

        {/* Stats Section */}
        <TeamStats refreshKey={refreshKey} />
      </main>
    </div>
  );
}
