import { useState, useEffect } from "react";
import { LayoutDashboard, GraduationCap, BookOpen, Megaphone, Calendar } from "lucide-react";
import { useAppContext } from "../../context/AppContext";
import { MetricCard, Card } from "../../components/shared";

export default function TeacherDashboardPage() {
  const { students, announcements, homeworkTasks, fetchHomeworkTasks } = useAppContext();
  const activeStudents = students.filter((s) => s.status === "ACTIVE").length;

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
          <h2 className="text-lg font-bold text-slate-800">Teacher Dashboard</h2>
          <p className="text-xs text-slate-400">Your class overview</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard icon={GraduationCap} label="Active Students" value={activeStudents} color="blue" />
        <MetricCard icon={BookOpen} label="Homework Tasks" value={homeworkTasks.length} color="amber" />
        <MetricCard icon={Megaphone} label="Announcements" value={announcements.length} color="purple" />
        <MetricCard icon={Calendar} label="This Week" value="6 Classes" color="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-6">
          <h3 className="font-semibold text-slate-800 mb-3">Recent Announcements</h3>
          <div className="space-y-2">
            {announcements.slice(0, 3).map((a) => (
              <div key={a.id} className="p-3 bg-slate-50 rounded-lg">
                <p className="text-sm font-medium text-slate-800">{a.title}</p>
                <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{a.content}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-6">
          <h3 className="font-semibold text-slate-800 mb-3">Recent Homework Tasks</h3>
          <div className="space-y-2">
            {homeworkTasks.slice(0, 3).map((t) => (
              <div key={t.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-slate-800">{t.taskDetails}</p>
                  <p className="text-xs text-slate-400">{t.branchName} · {t.assignedDate}</p>
                </div>
                <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-medium">{t.branchName}</span>
              </div>
            ))}
            {homeworkTasks.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">No homework tasks yet.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
