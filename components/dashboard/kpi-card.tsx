import { LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend: {
    value: number;
    isPositive: boolean;
  };
}

export function KPICard({ title, value, icon: Icon, trend }: KPICardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-3xl font-semibold text-gray-900 mt-2">{value}</p>
          <div className="flex items-center gap-1 mt-3">
            <span
              className={`text-xs font-medium ${
                trend.isPositive ? "text-green-600" : "text-red-600"
              }`}
            >
              {trend.isPositive ? "+" : "-"}
              {trend.value}%
            </span>
            <span className="text-xs text-gray-400">from last month</span>
          </div>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <Icon className="w-5 h-5 text-gray-600" />
        </div>
      </div>
    </div>
  );
}
