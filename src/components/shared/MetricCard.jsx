import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function MetricCard({ icon: Icon, label, value, color, sub, trend }) {
  const colors = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    green: "bg-emerald-50 text-emerald-600 border-emerald-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100",
  };
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
          {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
          {trend && (
            <p className={`text-xs font-medium mt-1 flex items-center gap-0.5 ${trend > 0 ? "text-emerald-600" : "text-red-500"}`}>
              {trend > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {Math.abs(trend)}% vs last month
            </p>
          )}
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${colors[color]}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}
