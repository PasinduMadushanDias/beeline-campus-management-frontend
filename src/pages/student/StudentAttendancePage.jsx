import { useEffect } from "react";
import { CalendarCheck, CheckCircle2, XCircle } from "lucide-react";
import { useAppContext } from "../../context/AppContext";
import { useAuth } from "../../context/AuthContext";
import { PageHeader, Card, MetricCard } from "../../components/shared";

export default function StudentAttendancePage() {
  const { user } = useAuth();
  const { attendance, fetchMyAttendance } = useAppContext();

  useEffect(() => {
    if (user?.id) fetchMyAttendance(user.id);
  }, [user?.id, fetchMyAttendance]);

  const present = attendance.filter((a) => a.present).length;
  const absent = attendance.filter((a) => !a.present).length;
  const rate = attendance.length > 0 ? Math.round((present / attendance.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <PageHeader icon={CalendarCheck} title="My Attendance" subtitle={`Attendance record for ${user?.fullName || "Student"}`} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard icon={CalendarCheck} label="Attendance Rate" value={`${rate}%`} color="green" sub={`${attendance.length} total days`} />
        <MetricCard icon={CheckCircle2} label="Present" value={present} color="blue" />
        <MetricCard icon={XCircle} label="Absent" value={absent} color="rose" />
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <th className="text-left py-3 px-5 font-semibold">#</th>
              <th className="text-left py-3 px-5 font-semibold">Date</th>
              <th className="text-left py-3 px-5 font-semibold">Status</th>
              <th className="text-left py-3 px-5 font-semibold">Marked By</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100">
              {attendance.map((a, i) => (
                <tr key={a.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-5 text-slate-400 text-xs">{i + 1}</td>
                  <td className="py-3 px-5 text-slate-700 font-medium">{a.date}</td>
                  <td className="py-3 px-5">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${a.present ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                      {a.present ? <><CheckCircle2 size={11} /> Present</> : <><XCircle size={11} /> Absent</>}
                    </span>
                  </td>
                  <td className="py-3 px-5 text-slate-500 text-xs">{a.markedByName}</td>
                </tr>
              ))}
              {attendance.length === 0 && (
                <tr><td colSpan={4} className="py-12 text-center text-sm text-slate-400">
                  <CalendarCheck size={28} className="mx-auto mb-2 text-slate-300" />
                  No attendance records yet.
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
