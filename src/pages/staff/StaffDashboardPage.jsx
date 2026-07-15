import { useEffect } from "react";
import { LayoutDashboard, ClipboardCheck, CalendarCheck, Users, BookOpen } from "lucide-react";
import { useAppContext } from "../../context/AppContext";
import { MetricCard, Card } from "../../components/shared";

export default function StaffDashboardPage() {
  const { students, homeworkTasks, fetchHomeworkTasks } = useAppContext();

  useEffect(() => {
    fetchHomeworkTasks();
  }, [fetchHomeworkTasks]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100">
          <LayoutDashboard size={20} className="text-indigo-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800">Staff Dashboard</h2>
          <p className="text-xs text-slate-400">Administrative overview</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard icon={Users} label="Total Students" value={students.length} color="blue" />
        <MetricCard icon={ClipboardCheck} label="Homework Tasks" value={homeworkTasks.length} color="amber" />
        <MetricCard icon={BookOpen} label="Branches" value="2" color="green" />
        <MetricCard icon={CalendarCheck} label="Attendance Logs" value="12" color="purple" sub="Last 2 weeks" />
      </div>

      <Card className="p-6">
        <h3 className="font-semibold text-slate-800 mb-3">Recent Homework Tasks</h3>
        <div className="space-y-2">
          {homeworkTasks.slice(0, 5).map((t) => (
            <div key={t.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-slate-800">{t.taskDetails}</p>
                <p className="text-xs text-slate-400">{t.branchName} · {t.assignedDate}</p>
              </div>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">{t.branchName}</span>
            </div>
          ))}
          {homeworkTasks.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-4">No homework tasks yet.</p>
          )}
        </div>
      </Card>
    </div>
  );
}
