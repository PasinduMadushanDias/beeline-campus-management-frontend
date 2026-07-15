import {
  GraduationCap, Users, DollarSign, BookOpen, LayoutDashboard,
  Building2, UserPlus, Megaphone, ClipboardCheck, CreditCard,
  BarChart3, Zap, ChevronRight,
} from "lucide-react";
import { useAppContext } from "../../context/AppContext";
import { MONTHS } from "../../constants";
import { MetricCard, Card, BranchBadge } from "../../components/shared";

const ICON_COLORS = {
  blue: "text-blue-600", teal: "text-teal-600", purple: "text-purple-600",
  amber: "text-amber-600", rose: "text-rose-600", emerald: "text-emerald-600",
  cyan: "text-cyan-600", orange: "text-orange-600",
};

export default function AdminDashboardPage() {
  const { students, staffMembers, branches } = useAppContext();
  const activeStudents = students.filter((s) => s.status === "ACTIVE").length;
  const teachers = staffMembers.filter((s) => s.role === "TEACHER").length;
  const staffCount = staffMembers.filter((s) => s.role === "STAFF").length;
  const revenueData = [42, 55, 38, 62, 71, 58, 65];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100">
            <LayoutDashboard size={20} className="text-indigo-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Dashboard Overview</h2>
            <p className="text-xs text-slate-400">Campus-wide performance at a glance</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard icon={GraduationCap} label="Active Students" value={activeStudents} color="blue" sub={`${students.length} total enrolled`} trend={12} />
        <MetricCard icon={BookOpen} label="Teachers" value={teachers} color="purple" sub={`Across ${branches.length} branches`} />
        <MetricCard icon={Users} label="Staff Members" value={staffCount} color="green" sub="Admin & support" />
        <MetricCard icon={DollarSign} label="Monthly Revenue" value="Rs. 35,000" color="amber" trend={8} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 size={18} className="text-indigo-600" />
              <h3 className="font-semibold text-slate-800">Revenue Overview</h3>
            </div>
            <span className="text-xs text-slate-400">Last 7 months</span>
          </div>
          <div className="flex items-end gap-3 h-40">
            {revenueData.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-gradient-to-t from-indigo-500 to-blue-400 rounded-t-md transition-all hover:from-indigo-600 hover:to-blue-500" style={{ height: `${v * 1.5}%` }} />
                <span className="text-xs text-slate-400">{MONTHS[i].slice(0, 3)}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap size={18} className="text-amber-500" />
            <h3 className="font-semibold text-slate-800">Quick Actions</h3>
          </div>
          <div className="space-y-2">
            {[
              { icon: UserPlus, label: "Add New Student", color: "text-blue-600 bg-blue-50" },
              { icon: Megaphone, label: "Post Announcement", color: "text-purple-600 bg-purple-50" },
              { icon: ClipboardCheck, label: "Review Homework", color: "text-emerald-600 bg-emerald-50" },
              { icon: CreditCard, label: "Manage Fees", color: "text-amber-600 bg-amber-50" },
              { icon: BarChart3, label: "View Reports", color: "text-rose-600 bg-rose-50" },
            ].map((a, i) => (
              <button key={i} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors text-left cursor-pointer group">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${a.color}`}><a.icon size={15} /></div>
                <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">{a.label}</span>
                <ChevronRight size={14} className="ml-auto text-slate-300 group-hover:text-slate-500" />
              </button>
            ))}
          </div>
        </Card>
      </div>

      <div className={`grid gap-4 ${branches.length === 1 ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"}`}>
        {branches.map((b) => (
          <Card key={b.id} className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Building2 size={18} className={ICON_COLORS[b.color] || "text-blue-600"} />
              <h3 className="font-semibold text-slate-800">{b.name} Branch</h3>
              <BranchBadge branch={b.name} />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-50 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-slate-800">{students.filter((s) => s.branchName === b.name).length}</p>
                <p className="text-xs text-slate-500">Students</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3 text-center">
                <p className="text-sm font-bold text-slate-800 mt-0.5">{b.duration}</p>
                <p className="text-xs text-slate-500">Duration</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3 text-center">
                <p className="text-sm font-bold text-slate-800 mt-0.5">Rs. {(b.totalFee || 0).toLocaleString()}</p>
                <p className="text-xs text-slate-500">Course Fee</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3 text-center">
                <p className="text-sm font-bold text-slate-800 mt-0.5">{b.installmentsCount}x</p>
                <p className="text-xs text-slate-500">Installments</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
