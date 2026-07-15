export default function StatusBadge({ status }) {
  const map = {
    Active: "bg-emerald-50 text-emerald-700", Inactive: "bg-slate-100 text-slate-500",
    "On Leave": "bg-amber-50 text-amber-700", Paid: "bg-emerald-50 text-emerald-700",
    Pending: "bg-amber-50 text-amber-700", Completed: "bg-emerald-50 text-emerald-700",
    Uncomplete: "bg-red-50 text-red-700",
  };
  const dotMap = {
    Active: "bg-emerald-500", Inactive: "bg-slate-400", "On Leave": "bg-amber-500",
    Paid: "bg-emerald-500", Pending: "bg-amber-500", Completed: "bg-emerald-500", Uncomplete: "bg-red-500",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${map[status] || "bg-slate-100 text-slate-500"}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotMap[status] || "bg-slate-400"}`} />
      {status}
    </span>
  );
}
