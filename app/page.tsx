"use client";

import { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/header";
import { TeamPerformance } from "@/components/dashboard/team-performance";

export default function Dashboard() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader onRefresh={() => setRefreshKey((prev) => prev + 1)} />

      <main className="w-full px-4 py-4">
        {/* Team Performance */}
        <TeamPerformance refreshKey={refreshKey} />
      </main>
    </div>
  );
}
