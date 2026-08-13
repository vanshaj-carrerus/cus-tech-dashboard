import { Menu, RefreshCw } from "lucide-react";
import Link from "next/link";

interface DashboardHeaderProps {
  onRefresh?: () => void;
}

export function DashboardHeader({ onRefresh }: DashboardHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">
              Welcome back. Here's what's happening today.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex gap-2">
              <Link
                href="/"
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Candidates
              </Link>
              <Link
                href="/team-activity"
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Team Activity
              </Link>
            </nav>
            <button
              onClick={onRefresh}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
              title="Refresh data"
            >
              <RefreshCw className="w-5 h-5 text-gray-600 hover:text-gray-900" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
