"use client";

import { useEffect, useState } from "react";
import React from "react";
import { Users, Briefcase, Phone, Edit2, ChevronDown, ChevronUp, X, Trash2 } from "lucide-react";

interface TeamMemberStat {
  id: string;
  teamMemberName: string;
  applicationsCount: number;
  interviewsCount: number;
  reachOutsCount: number;
  submittedAt: string;
}

interface HistoryStat extends TeamMemberStat {
  date: string;
  isEdit?: boolean;
  previousValues?: {
    applicationsCount: number;
    interviewsCount: number;
    reachOutsCount: number;
  };
}

interface TeamStatsData {
  todayStats: TeamMemberStat[];
  totals: {
    totalApplications: number;
    totalInterviews: number;
    totalReachOuts: number;
    teamMembersSubmitted: number;
  };
}

interface TeamStatsProps {
  refreshKey?: number;
}

interface EditFormData {
  applicationsCount: number;
  interviewsCount: number;
  reachOutsCount: number;
}

export function TeamStats({ refreshKey = 0 }: TeamStatsProps) {
  const [stats, setStats] = useState<TeamStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCandidate, setExpandedCandidate] = useState<string | null>(null);
  const [candidateHistory, setCandidateHistory] = useState<Record<string, HistoryStat[]>>({});
  const [historyLoading, setHistoryLoading] = useState<Record<string, boolean>>({});
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedStat, setSelectedStat] = useState<TeamMemberStat | null>(null);
  const [editFormData, setEditFormData] = useState<EditFormData>({ applicationsCount: 0, interviewsCount: 0, reachOutsCount: 0 });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [statToDelete, setStatToDelete] = useState<TeamMemberStat | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const openEditModal = (stat: TeamMemberStat) => {
    setSelectedStat(stat);
    setEditFormData({
      applicationsCount: stat.applicationsCount,
      interviewsCount: stat.interviewsCount,
      reachOutsCount: stat.reachOutsCount,
    });
    setEditError(null);
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setSelectedStat(null);
    setEditFormData({ applicationsCount: 0, interviewsCount: 0, reachOutsCount: 0 });
    setEditError(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStat) return;

    try {
      setEditLoading(true);
      setEditError(null);
      
      const teamMemberName = selectedStat.teamMemberName;
      const statId = selectedStat.id;

      const response = await fetch("/api/daily-stats", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: statId,
          teamMemberName: teamMemberName,
          applicationsCount: parseInt(editFormData.applicationsCount.toString()),
          interviewsCount: parseInt(editFormData.interviewsCount.toString()),
          reachOutsCount: parseInt(editFormData.reachOutsCount.toString()),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to update submission");
      }

      // Clear history cache for this candidate so it refetches fresh data
      setCandidateHistory((prev) => {
        const updated = { ...prev };
        delete updated[teamMemberName];
        return updated;
      });

      // Reload the stats
      const statsResponse = await fetch("/api/daily-stats");
      const statsResult = await statsResponse.json();
      if (statsResult.success && statsResult.data) {
        setStats(statsResult.data);
      }

      // Auto-expand history to show updated entry
      setExpandedCandidate(teamMemberName);
      
      // Auto-fetch fresh history
      try {
        const historyResponse = await fetch(
          `/api/daily-stats/history?candidate=${encodeURIComponent(teamMemberName)}`
        );
        if (historyResponse.ok) {
          const historyResult = await historyResponse.json();
          if (historyResult.success && historyResult.data) {
            setCandidateHistory((prev) => ({
              ...prev,
              [teamMemberName]: historyResult.data,
            }));
          }
        }
      } catch (err) {
        console.error("Error fetching updated history:", err);
      }

      closeEditModal();
    } catch (err) {
      console.error("Error updating stats:", err);
      setEditError(err instanceof Error ? err.message : "Failed to update submission");
    } finally {
      setEditLoading(false);
    }
  };

  const openDeleteConfirm = (stat: TeamMemberStat) => {
    setStatToDelete(stat);
    setDeleteError(null);
    setDeleteConfirmOpen(true);
  };

  const closeDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
    setStatToDelete(null);
    setDeleteError(null);
  };

  const handleDeleteSubmit = async () => {
    if (!statToDelete) return;

    try {
      setDeleteLoading(true);
      setDeleteError(null);

      const response = await fetch("/api/daily-stats", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: statToDelete.id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to delete submission");
      }

      // Reload the stats
      const statsResponse = await fetch("/api/daily-stats");
      const statsResult = await statsResponse.json();
      if (statsResult.success && statsResult.data) {
        setStats(statsResult.data);
      }

      closeDeleteConfirm();
    } catch (err) {
      console.error("Error deleting stats:", err);
      setDeleteError(err instanceof Error ? err.message : "Failed to delete submission");
    } finally {
      setDeleteLoading(false);
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/daily-stats");

        if (!response.ok) {
          throw new Error("Failed to fetch stats");
        }

        const result = await response.json();

        if (result.success && result.data) {
          setStats(result.data);
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    const intervalId = window.setInterval(() => {
      fetchStats();
    }, 60000);

    return () => window.clearInterval(intervalId);
  }, [refreshKey]);

  const fetchCandidateHistory = async (candidateName: string) => {
    if (candidateHistory[candidateName]) {
      return;
    }

    try {
      setHistoryLoading((prev) => ({ ...prev, [candidateName]: true }));
      const response = await fetch(`/api/daily-stats/history?candidate=${encodeURIComponent(candidateName)}`);

      if (!response.ok) {
        throw new Error("Failed to fetch history");
      }

      const result = await response.json();

      if (result.success && result.data) {
        setCandidateHistory((prev) => ({
          ...prev,
          [candidateName]: result.data,
        }));
      }
    } catch (err) {
      console.error("Error fetching history:", err);
    } finally {
      setHistoryLoading((prev) => ({ ...prev, [candidateName]: false }));
    }
  };

  const toggleCandidateHistory = (candidateName: string) => {
    if (expandedCandidate === candidateName) {
      setExpandedCandidate(null);
    } else {
      setExpandedCandidate(candidateName);
      fetchCandidateHistory(candidateName);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">Loading team stats...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  if (!stats || stats.todayStats.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Today's Totals Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Team Members Submitted</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {stats.totals.teamMembersSubmitted}
              </p>
              <p className="text-xs text-gray-400 mt-2">out of 20</p>
            </div>
            <Users className="w-8 h-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Applications</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {stats.totals.totalApplications}
              </p>
              <p className="text-xs text-gray-400 mt-2">today</p>
            </div>
            <Briefcase className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Interviews</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {stats.totals.totalInterviews}
              </p>
              <p className="text-xs text-gray-400 mt-2">today</p>
            </div>
            <Phone className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Reach Outs</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {stats.totals.totalReachOuts}
              </p>
              <p className="text-xs text-gray-400 mt-2">today</p>
            </div>
            <Phone className="w-8 h-8 text-amber-500" />
          </div>
        </div>
      </div>

      {/* Team Members List */}
      {stats.todayStats.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900">
              Today's Submissions ({stats.todayStats.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Team Member
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Applications
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Interviews
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Reach Outs
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Submitted At
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stats.todayStats.map((stat) => (
                  <React.Fragment key={stat.id}>
                    <tr className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm font-medium text-gray-900">
                          {stat.teamMemberName}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                          {stat.applicationsCount}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700">
                          {stat.interviewsCount}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
                          {stat.reachOutsCount}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm text-gray-500">{stat.submittedAt}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEditModal(stat)}
                            className="p-1 hover:bg-blue-50 rounded transition-colors"
                            title="Edit submission"
                          >
                            <Edit2 className="w-4 h-4 text-blue-600" />
                          </button>
                          <button
                            onClick={() => toggleCandidateHistory(stat.teamMemberName)}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                            title="View history"
                          >
                            {expandedCandidate === stat.teamMemberName ? (
                              <ChevronUp className="w-4 h-4 text-gray-600" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-600" />
                            )}
                          </button>
                          <button
                            onClick={() => openDeleteConfirm(stat)}
                            className="p-1 hover:bg-red-50 rounded transition-colors"
                            title="Delete submission"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedCandidate === stat.teamMemberName && (
                      <tr className="bg-blue-50">
                        <td colSpan={6} className="px-6 py-4">
                          {historyLoading[stat.teamMemberName] ? (
                            <p className="text-sm text-gray-600">Loading history...</p>
                          ) : candidateHistory[stat.teamMemberName] && candidateHistory[stat.teamMemberName].length > 0 ? (
                            <div className="bg-white rounded border border-gray-200 overflow-hidden">
                              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                                <h4 className="text-sm font-semibold text-gray-900">
                                  Submission History - {stat.teamMemberName} ({candidateHistory[stat.teamMemberName].length} entries)
                                </h4>
                              </div>
                              <div className="max-h-96 overflow-y-auto">
                                <table className="w-full text-sm">
                                  <thead className="sticky top-0">
                                    <tr className="border-b border-gray-200 bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 whitespace-nowrap">Date</th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 whitespace-nowrap">Apps</th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 whitespace-nowrap">Interviews</th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 whitespace-nowrap">Reach Outs</th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 whitespace-nowrap">Submitted</th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 whitespace-nowrap">Status</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-200">
                                    {candidateHistory[stat.teamMemberName].map((history, idx) => (
                                      <tr key={idx} className={`hover:bg-gray-50 ${history.isEdit ? "bg-amber-50" : ""}`}>
                                        <td className="px-3 py-1.5 text-xs text-gray-600 whitespace-nowrap">{history.date}</td>
                                        <td className="px-3 py-1.5 text-xs">
                                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                            {history.applicationsCount}
                                          </span>
                                        </td>
                                        <td className="px-3 py-1.5 text-xs">
                                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700">
                                            {history.interviewsCount}
                                          </span>
                                        </td>
                                        <td className="px-3 py-1.5 text-xs">
                                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
                                            {history.reachOutsCount}
                                          </span>
                                        </td>
                                        <td className="px-3 py-1.5 text-xs text-gray-500 whitespace-nowrap">{history.submittedAt}</td>
                                        <td className="px-3 py-1.5 text-xs">
                                          {history.isEdit ? (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                                              Edited
                                            </span>
                                          ) : (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                              Original
                                            </span>
                                          )}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-600">No history available</p>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModalOpen && selectedStat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Edit Submission - {selectedStat.teamMemberName}
              </h3>
              <button
                onClick={closeEditModal}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              {editError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                  {editError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Applications
                </label>
                <input
                  type="number"
                  min="0"
                  value={editFormData.applicationsCount}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, applicationsCount: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interviews
                </label>
                <input
                  type="number"
                  min="0"
                  value={editFormData.interviewsCount}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, interviewsCount: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reach Outs
                </label>
                <input
                  type="number"
                  min="0"
                  value={editFormData.reachOutsCount}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, reachOutsCount: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && statToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Delete Submission
              </h3>
              <button
                onClick={closeDeleteConfirm}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {deleteError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                  {deleteError}
                </div>
              )}

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">
                  Are you sure you want to delete this submission for <strong>{statToDelete.teamMemberName}</strong>?
                </p>
                <p className="text-xs text-red-700 mt-2">
                  This action cannot be undone.
                </p>
              </div>

              <div className="pt-2 space-y-2 text-sm text-gray-600">
                <p><strong>Applications:</strong> {statToDelete.applicationsCount}</p>
                <p><strong>Interviews:</strong> {statToDelete.interviewsCount}</p>
                <p><strong>Reach Outs:</strong> {statToDelete.reachOutsCount}</p>
              </div>

              <div className="flex gap-3 pt-6">
                <button
                  onClick={closeDeleteConfirm}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteSubmit}
                  disabled={deleteLoading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleteLoading ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
