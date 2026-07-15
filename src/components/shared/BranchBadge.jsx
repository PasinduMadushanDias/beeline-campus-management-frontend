import { MapPin } from "lucide-react";
import { useAppContext } from "../../context/AppContext";

const COLOR_MAP = {
  blue: "bg-blue-50 text-blue-700",
  teal: "bg-teal-50 text-teal-700",
  purple: "bg-purple-50 text-purple-700",
  amber: "bg-amber-50 text-amber-700",
  rose: "bg-rose-50 text-rose-700",
  emerald: "bg-emerald-50 text-emerald-700",
  cyan: "bg-cyan-50 text-cyan-700",
  orange: "bg-orange-50 text-orange-700",
};

export default function BranchBadge({ branch }) {
  const { branches } = useAppContext();
  const branchData = branches.find((b) => b.name === branch);
  const colorClass = COLOR_MAP[branchData?.color] || "bg-slate-100 text-slate-600";

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${colorClass}`}>
      <MapPin size={10} /> {branch}
    </span>
  );
}
