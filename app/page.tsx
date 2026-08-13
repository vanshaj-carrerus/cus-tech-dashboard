"use client";

import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/dashboard/header";
import { TeamPerformance } from "@/components/dashboard/team-performance";
import { LoginForm } from "@/components/dashboard/login-form";

export default function Dashboard() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    const auth = localStorage.getItem("dashboardAuth");
    if (auth === "true") {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("dashboardAuth");
    localStorage.removeItem("authTimestamp");
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader onRefresh={() => setRefreshKey((prev) => prev + 1)} onLogout={handleLogout} />

      <main className="w-full px-4 py-4">
        {/* Team Performance */}
        <TeamPerformance refreshKey={refreshKey} />
      </main>
    </div>
  );
}
