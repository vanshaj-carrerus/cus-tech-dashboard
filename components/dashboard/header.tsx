import { Menu, RefreshCw, LogOut } from "lucide-react";
import Link from "next/link";

interface DashboardHeaderProps {
  onRefresh?: () => void;
  onLogout?: () => void;
}

export function DashboardHeader({ onRefresh, onLogout }: DashboardHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-2 md:py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Dashboard</h1>
            <p className="text-xs md:text-sm text-gray-500 mt-1">
              Welcome back. Here's what's happening today.
            </p>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <nav className="hidden md:flex gap-2">
              <Link
                href="/"
                className="px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Candidates
              </Link>
              <Link
                href="/team-activity"
                className="px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Team Activity
              </Link>
            </nav>
            <button
              onClick={onRefresh}
              className="p-1.5 md:p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-gray-900"
              title="Refresh data"
            >
              <RefreshCw className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            {onLogout && (
              <button
                onClick={onLogout}
                className="px-2 md:px-4 py-1.5 md:py-2 bg-red-600 text-white text-xs md:text-sm rounded-lg hover:bg-red-700 transition-colors flex items-center gap-1 md:gap-2"
                title="Logout"
              >
                <LogOut className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
