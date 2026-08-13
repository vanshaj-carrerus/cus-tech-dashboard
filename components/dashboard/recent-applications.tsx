"use client";

import { useEffect, useState } from "react";

interface ApplicationRecord {
  id: string;
  name: string;
  role: string;
  status: "Applied" | "Interviewing" | "Reached Out" | "Rejected" | "Hired";
  date: string;
}

const statusStyles = {
  Applied: "bg-blue-50 text-blue-700 border border-blue-200",
  Interviewing: "bg-purple-50 text-purple-700 border border-purple-200",
  "Reached Out": "bg-amber-50 text-amber-700 border border-amber-200",
  Rejected: "bg-red-50 text-red-700 border border-red-200",
  Hired: "bg-green-50 text-green-700 border border-green-200",
};

export function RecentApplications() {
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/candidates/applications");
        
        if (!response.ok) {
          throw new Error("Failed to fetch applications");
        }

        const result = await response.json();
        
        if (result.success && result.data) {
          setApplications(result.data);
        } else {
          throw new Error(result.message || "Failed to load data");
        }
      } catch (err) {
        console.error("Error fetching applications:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
        // Fallback to mock data
        setApplications([
          {
            id: "1",
            name: "Sarah Johnson",
            role: "Senior Frontend Engineer",
            status: "Interviewing",
            date: "Aug 12, 2024",
          },
          {
            id: "2",
            name: "Michael Chen",
            role: "Product Manager",
            status: "Applied",
            date: "Aug 11, 2024",
          },
          {
            id: "3",
            name: "Emily Rodriguez",
            role: "UX Designer",
            status: "Reached Out",
            date: "Aug 10, 2024",
          },
          {
            id: "4",
            name: "David Smith",
            role: "Backend Engineer",
            status: "Interviewing",
            date: "Aug 9, 2024",
          },
          {
            id: "5",
            name: "Jessica Lee",
            role: "Data Analyst",
            status: "Hired",
            date: "Aug 8, 2024",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          Recent Applications
        </h2>
      </div>

      {loading && (
        <div className="px-6 py-12 text-center">
          <p className="text-gray-500">Loading applications...</p>
        </div>
      )}

      {error && (
        <div className="px-6 py-4 bg-amber-50 border-t border-amber-200">
          <p className="text-sm text-amber-700">
            Note: Using sample data. Connect to MongoDB to see real data.
          </p>
        </div>
      )}

      {!loading && applications.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {applications.map((app) => (
                <tr
                  key={app.id}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm font-medium text-gray-900">
                      {app.name}
                    </p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm text-gray-600">{app.role}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        statusStyles[app.status]
                      }`}
                    >
                      {app.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm text-gray-500">{app.date}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
