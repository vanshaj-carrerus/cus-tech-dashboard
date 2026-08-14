"use client";

import { useEffect, useState } from "react";
import { Trophy, TrendingUp, TrendingDown } from "lucide-react";

interface TopPerformer {
  name: string;
  applications: number;
  interviews: number;
  reachOuts: number;
  submissions: number;
}

interface TeamMember {
  name: string;
  applications: number;
  interviews: number;
  reachOuts: number;
  submissions: number;
  lastSubmitted: string;
}

interface TeamPerformanceData {
  allTeamMembers: TeamMember[];
  topPerformers: TopPerformer[];
  lowestPerformers: TopPerformer[];
}

interface TeamPerformanceProps {
  refreshKey?: number;
}

export function TeamPerformance({ refreshKey = 0 }: TeamPerformanceProps) {
  const [data, setData] = useState<TeamPerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/team-performance");

        if (!response.ok) {
          throw new Error("Failed to fetch performance data");
        }

        const result = await response.json();

        if (result.success && result.data) {
          setData(result.data);
        }
      } catch (err) {
        console.error("Error fetching performance:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchPerformance();
  }, [refreshKey]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-xl text-gray-500">Loading team performance...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-8">
        <p className="text-lg text-gray-600">No team data yet. Start logging daily activity!</p>
      </div>
    );
  }

  if (!data || data.allTeamMembers.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
        <p className="text-lg text-gray-500">
          No team performance data yet. Team members need to submit their daily stats first.
        </p>
      </div>
    );
  }

  // Get top 3 performers from API (already sorted by priority: Interviews > Applications > Reach Outs)
  const top3Performers = data.topPerformers.slice(0, 3);
  
  // Sort all team members by the same priority (Interviews > Applications > Reach Outs) for overall ranking
  const sortedAllMembers = [...data.allTeamMembers].sort((a, b) => {
    if (a.interviews !== b.interviews) {
      return b.interviews - a.interviews;
    }
    if (a.applications !== b.applications) {
      return b.applications - a.applications;
    }
    return b.reachOuts - a.reachOuts;
  });
  
  // Get remaining candidates (all team members excluding top 3) with proper ranking
  const top3Names = new Set(top3Performers.map(p => p.name));
  const allRemainingCandidates = sortedAllMembers
    .filter(member => !top3Names.has(member.name))
    .map((member, idx) => ({
      ...member,
      actualRank: idx + 4, // Start from 4 since top 3 are already ranked 1-3
    }));
  
  // For "Needs Support" section, show lowest performers first (ascending by performance)
  const remainingCandidates = [...allRemainingCandidates].reverse();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 w-full">
      {/* TOP PERFORMERS SECTION */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className="px-4 md:px-6 py-3 md:py-4 border-b-2 border-amber-200 bg-gradient-to-r from-gray-50 to-amber-50">
          <div className="flex items-center gap-3">
            <Trophy className="w-6 md:w-8 h-6 md:h-8 text-amber-600" />
            <h3 className="text-2xl md:text-4xl font-bold text-gray-900">Top Performers</h3>
          </div>
          <p className="text-sm md:text-lg text-gray-600 mt-1 md:mt-2 font-medium">Ranked by interviews, then applications, then reach outs</p>
        </div>
        {top3Performers.length > 0 && (
          <div className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 border-b-2 border-amber-300 px-3 md:px-6 py-4 md:py-8 shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="inline-block bg-gradient-to-r from-amber-400 to-orange-400 text-white px-2 md:px-4 py-1 md:py-2 rounded-full text-xs md:text-sm font-bold mb-2 md:mb-3 shadow-md">🏆 TOP PERFORMER</div>
                <h2 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-amber-900 to-orange-900 bg-clip-text text-transparent mb-1 md:mb-2">{top3Performers[0].name}</h2>
                <p className="text-xs md:text-sm text-amber-700 font-semibold mb-3 md:mb-4">Leading the recruitment efforts</p>
                <div className="flex gap-2 md:gap-6 flex-wrap">
                  <div className="bg-white/60 backdrop-blur rounded-lg px-2 md:px-4 py-2 md:py-3 border border-amber-200 hover:bg-white hover:shadow-md transition-all duration-200">
                    <p className="text-xs text-amber-600 font-bold uppercase tracking-wide">Interviews</p>
                    <p className="text-xl md:text-3xl font-bold text-amber-900 mt-1">{top3Performers[0].interviews}</p>
                  </div>
                  <div className="bg-white/60 backdrop-blur rounded-lg px-2 md:px-4 py-2 md:py-3 border border-amber-200 hover:bg-white hover:shadow-md transition-all duration-200">
                    <p className="text-xs text-amber-600 font-bold uppercase tracking-wide">Applications</p>
                    <p className="text-xl md:text-3xl font-bold text-amber-900 mt-1">{top3Performers[0].applications}</p>
                  </div>
                  <div className="bg-white/60 backdrop-blur rounded-lg px-2 md:px-4 py-2 md:py-3 border border-amber-200 hover:bg-white hover:shadow-md transition-all duration-200">
                    <p className="text-xs text-amber-600 font-bold uppercase tracking-wide">Reach Outs</p>
                    <p className="text-xl md:text-3xl font-bold text-amber-900 mt-1">{top3Performers[0].reachOuts}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-amber-200 bg-gradient-to-r from-gray-50 to-amber-50">
                <th className="px-1 md:px-1.5 py-0.5 md:py-1.5 text-left text-[10px] md:text-lg font-bold text-gray-800 uppercase tracking-wider">Rank</th>
                <th className="px-0.5 md:px-1.5 py-0.5 md:py-1.5 text-left text-[10px] md:text-lg font-bold text-gray-800 uppercase tracking-wider">Name</th>
                <th className="px-1 md:px-1.5 py-0.5 md:py-1.5 text-left text-[10px] md:text-lg font-bold text-amber-700 uppercase tracking-wider">Interviews</th>
                <th className="px-1 md:px-1.5 py-0.5 md:py-1.5 text-left text-[10px] md:text-lg font-bold text-gray-800 uppercase tracking-wider">Applications</th>
                <th className="px-1 md:px-1.5 py-0.5 md:py-1.5 text-left text-[10px] md:text-lg font-bold text-gray-800 uppercase tracking-wider">Reach Outs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {top3Performers.map((member, idx) => (
                <tr key={member.name} className="hover:bg-amber-50/50 transition-colors duration-200 border-b border-gray-100 last:border-b-0">
                  <td className="px-1 md:px-1.5 py-0.5 md:py-1.5 whitespace-nowrap">
                    <span className="inline-flex items-center justify-center w-5 h-5 md:w-6 md:h-6 rounded-full bg-gradient-to-br from-amber-300 to-orange-400 text-[10px] md:text-xs font-bold text-white shadow-md hover:shadow-lg transition-shadow duration-200">
                      {idx + 1}
                    </span>
                  </td>
                  <td className="px-0.5 md:px-1.5 py-0.5 md:py-1.5 whitespace-nowrap">
                    <p className="text-[12px] md:text-lg font-semibold text-gray-900 group-hover:text-amber-700 transition-colors">{member.name}</p>
                  </td>
                  <td className="px-1 md:px-1.5 py-0.5 md:py-1.5 whitespace-nowrap text-left">
                    <span className="text-[11px] md:text-lg font-bold text-gray-900 bg-gradient-to-r from-amber-100 to-orange-100 px-1 md:px-1.5 py-0.5 rounded">{member.interviews}</span>
                  </td>
                  <td className="px-1 md:px-1.5 py-0.5 md:py-1.5 whitespace-nowrap text-left">
                    <span className="text-[11px] md:text-lg text-gray-700">{member.applications}</span>
                  </td>
                  <td className="px-1 md:px-1.5 py-0.5 md:py-1.5 whitespace-nowrap text-left">
                    <span className="text-[11px] md:text-lg text-gray-700">{member.reachOuts}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* LOWEST PERFORMERS SECTION */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className="px-4 md:px-6 py-3 md:py-4 border-b-2 border-red-200 bg-gradient-to-r from-gray-50 to-red-50">
          <div className="flex items-center gap-3">
            <TrendingDown className="w-6 md:w-8 h-6 md:h-8 text-red-600" />
            <h3 className="text-2xl md:text-4xl font-bold text-gray-900">Needs Support</h3>
          </div>
          <p className="text-sm md:text-lg text-gray-600 mt-1 md:mt-2 font-medium">Team members who need coaching and support</p>
        </div>
        {remainingCandidates.length > 0 && (
          <div className="bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 border-b-2 border-red-300 px-3 md:px-6 py-4 md:py-8 shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="inline-block bg-gradient-to-r from-red-400 to-rose-400 text-white px-2 md:px-4 py-1 md:py-2 rounded-full text-xs md:text-sm font-bold mb-2 md:mb-3 shadow-md">📊 NEEDS SUPPORT</div>
                <h2 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-red-900 to-rose-900 bg-clip-text text-transparent mb-1 md:mb-2">{remainingCandidates[0].name}</h2>
                <p className="text-xs md:text-sm text-red-700 font-semibold mb-3 md:mb-4">Focus area for coaching and growth</p>
                <div className="flex gap-2 md:gap-6 flex-wrap">
                  <div className="bg-white/60 backdrop-blur rounded-lg px-2 md:px-4 py-2 md:py-3 border border-red-200 hover:bg-white hover:shadow-md transition-all duration-200">
                    <p className="text-xs text-red-600 font-bold uppercase tracking-wide">Interviews</p>
                    <p className="text-xl md:text-3xl font-bold text-red-900 mt-1">{remainingCandidates[0].interviews}</p>
                  </div>
                  <div className="bg-white/60 backdrop-blur rounded-lg px-2 md:px-4 py-2 md:py-3 border border-red-200 hover:bg-white hover:shadow-md transition-all duration-200">
                    <p className="text-xs text-red-600 font-bold uppercase tracking-wide">Applications</p>
                    <p className="text-xl md:text-3xl font-bold text-red-900 mt-1">{remainingCandidates[0].applications}</p>
                  </div>
                  <div className="bg-white/60 backdrop-blur rounded-lg px-2 md:px-4 py-2 md:py-3 border border-red-200 hover:bg-white hover:shadow-md transition-all duration-200">
                    <p className="text-xs text-red-600 font-bold uppercase tracking-wide">Reach Outs</p>
                    <p className="text-xl md:text-3xl font-bold text-red-900 mt-1">{remainingCandidates[0].reachOuts}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-1 md:px-1.5 py-0.5 md:py-1.5 text-left text-[16px] md:text-lg font-semibold text-gray-700 uppercase tracking-wider">Rank</th>
                <th className="px-0.5 md:px-1.5 py-0.5 md:py-1.5 text-left text-[16px] md:text-lg font-semibold text-gray-700 uppercase tracking-wider">Name</th>
                <th className="px-1 md:px-1.5 py-0.5 md:py-1.5 text-left text-[16px] md:text-lg font-semibold text-gray-700 uppercase tracking-wider">Interviews</th>
                <th className="px-1 md:px-1.5 py-0.5 md:py-1.5 text-left text-[16px] md:text-lg font-semibold text-gray-700 uppercase tracking-wider">Applications</th>
                <th className="px-1 md:px-1.5 py-0.5 md:py-1.5 text-left text-[16px] md:text-lg font-semibold text-gray-700 uppercase tracking-wider">Reach Outs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {remainingCandidates.map((member) => (
                <tr key={member.name} className="hover:bg-red-50/50 transition-colors duration-200 border-b border-gray-100 last:border-b-0">
                  <td className="px-1 md:px-1.5 py-0.5 md:py-1.5 whitespace-nowrap">
                    <span className="inline-flex items-center justify-center w-5 h-5 md:w-6 md:h-6 rounded-full bg-gradient-to-br from-red-300 to-rose-400 text-[10px] md:text-xs font-bold text-white shadow-md hover:shadow-lg transition-shadow duration-200">
                      {member.actualRank}
                    </span>
                  </td>
                  <td className="px-0.5 md:px-1.5 py-0.5 md:py-1.5 whitespace-nowrap">
                    <p className="text-[12px] md:text-lg font-semibold text-gray-900 group-hover:text-red-700 transition-colors">{member.name}</p>
                  </td>
                  <td className="px-1 md:px-1.5 py-0.5 md:py-1.5 whitespace-nowrap text-left">
                    <span className="text-[11px] md:text-lg font-bold text-gray-900 bg-gradient-to-r from-red-100 to-rose-100 px-1 md:px-1.5 py-0.5 rounded">{member.interviews}</span>
                  </td>
                  <td className="px-1 md:px-1.5 py-0.5 md:py-1.5 whitespace-nowrap text-left">
                    <span className="text-[11px] md:text-lg text-gray-700">{member.applications}</span>
                  </td>
                  <td className="px-1 md:px-1.5 py-0.5 md:py-1.5 whitespace-nowrap text-left">
                    <span className="text-[11px] md:text-lg text-gray-700">{member.reachOuts}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
