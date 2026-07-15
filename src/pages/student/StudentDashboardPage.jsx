import { useState, useEffect } from "react";
import { GraduationCap, BookOpen, CalendarCheck, CreditCard, Clock, Bell, CheckCircle2, XCircle } from "lucide-react";
import { useAppContext } from "../../context/AppContext";
import { useAuth } from "../../context/AuthContext";
import { MetricCard, Card, BranchBadge } from "../../components/shared";

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const { announcements, branches, fetchMyHomework, fetchStudentView, attendance, fetchMyAttendance } = useAppContext();
  const [myHomework, setMyHomework] = useState([]);
  const [todayTasks, setTodayTasks] = useState([]);

  useEffect(() => {
    if (user?.id) {
      fetchMyHomework(user.id).then(setMyHomework);
      fetchMyAttendance(user.id);

      const branchId = user.branchId || user.branches?.[0]?.id;
      if (branchId) {
        const today = new Date().toISOString().slice(0, 10);
        fetchStudentView(branchId, today, user.id).then(setTodayTasks);
      }
    }
  }, [user?.id, fetchMyHomework, fetchMyAttendance, fetchStudentView]);

  const pending = myHomework.filter((h) => h.status === "PENDING").length;
  const present = attendance.filter((a) => a.present).length;
  const total = attendance.length;
  const branchName = user?.branchName || user?.branches?.[0]?.name || "";
  const branchData = branches.find((b) => b.name === branchName);

  const statusStyle = (s) =>
    s === "SUBMITTED" ? "bg-emerald-50 text-emerald-700" :
    s === "INCOMPLETE" ? "bg-red-50 text-red-700" :
    "bg-amber-50 text-amber-700";

  const statusLabel = (s) =>
    s === "SUBMITTED" ? "Complete" : s === "INCOMPLETE" ? "Incomplete" : "Pending";

  const statusIcon = (s) =>
    s === "SUBMITTED" ? <CheckCircle2 size={11} /> :
    s === "INCOMPLETE" ? <XCircle size={11} /> :
    <Clock size={11} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100">
          <GraduationCap size={20} className="text-indigo-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800">Welcome, {user?.fullName || "Student"}!</h2>
          <p className="text-xs text-slate-400 flex items-center gap-1">
            {branchName && <BranchBadge branch={branchName} />}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard icon={CalendarCheck} label="Attendance Rate" value={total > 0 ? `${Math.round((present / total) * 100)}%` : "—"} color="green" sub={`${present}/${total} days`} />
        <MetricCard icon={BookOpen} label="Pending Tasks" value={pending} color="amber" sub={`${myHomework.length} total assigned`} />
        <MetricCard icon={CreditCard} label="Course Fee" value={`Rs. ${(branchData?.totalFee ?? 0).toLocaleString()}`} color="blue" sub={`${branchData?.installmentsCount ?? 0} installments`} />
        <MetricCard icon={Clock} label="Duration" value={branchData?.duration ?? "—"} color="purple" sub={branchData?.schedule ?? ""} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-6">
          <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2"><BookOpen size={16} className="text-indigo-600" /> Today's Tasks</h3>
          <div className="space-y-2">
            {todayTasks.length > 0 ? todayTasks.map((h) => (
              <div key={h.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-slate-800">{h.taskDetails}</p>
                  <p className="text-xs text-slate-400">{h.assignedDate}</p>
                </div>
                <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${statusStyle(h.status)}`}>
                  {statusIcon(h.status)} {statusLabel(h.status)}
                </span>
              </div>
            )) : (
              <p className="text-sm text-slate-400 text-center py-4">No tasks assigned for today.</p>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2"><Bell size={16} className="text-indigo-600" /> Announcements</h3>
          <div className="space-y-2">
            {announcements.slice(0, 4).map((a) => (
              <div key={a.id} className="p-3 bg-slate-50 rounded-lg">
                <p className="text-sm font-medium text-slate-800">{a.title}</p>
                <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{a.content}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
