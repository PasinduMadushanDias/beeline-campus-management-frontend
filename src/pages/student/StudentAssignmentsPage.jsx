import { useState, useEffect } from "react";
import { BookOpen, CheckCircle2, XCircle, Clock, Calendar } from "lucide-react";
import { useAppContext } from "../../context/AppContext";
import { useAuth } from "../../context/AuthContext";
import { PageHeader, Card, MetricCard, EmptyState } from "../../components/shared";

export default function StudentAssignmentsPage() {
  const { user } = useAuth();
  const { fetchMyHomework } = useAppContext();
  const [myHomework, setMyHomework] = useState([]);

  useEffect(() => {
    if (user?.id) {
      fetchMyHomework(user.id).then(setMyHomework);
    }
  }, [user?.id, fetchMyHomework]);

  const submitted = myHomework.filter((h) => h.status === "SUBMITTED").length;
  const pending = myHomework.filter((h) => h.status === "PENDING").length;
  const incomplete = myHomework.filter((h) => h.status === "INCOMPLETE").length;

  const statusStyle = (status) => {
    if (status === "SUBMITTED") return "bg-emerald-50 text-emerald-700";
    if (status === "INCOMPLETE") return "bg-red-50 text-red-700";
    return "bg-amber-50 text-amber-700";
  };

  const statusIcon = (status) => {
    if (status === "SUBMITTED") return <CheckCircle2 size={11} />;
    if (status === "INCOMPLETE") return <XCircle size={11} />;
    return <Clock size={11} />;
  };

  const statusLabel = (status) => {
    if (status === "SUBMITTED") return "Complete";
    if (status === "INCOMPLETE") return "Incomplete";
    return "Pending";
  };

  return (
    <div className="space-y-6">
      <PageHeader icon={BookOpen} title="My Assignments" subtitle={`Homework record for ${user?.fullName || "Student"}`} />

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <MetricCard icon={BookOpen} label="Total Tasks" value={myHomework.length} color="blue" />
        <MetricCard icon={CheckCircle2} label="Complete" value={submitted} color="green" />
        <MetricCard icon={Clock} label="Pending" value={pending} color="amber" />
        <MetricCard icon={XCircle} label="Incomplete" value={incomplete} color="rose" />
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <th className="text-left py-3 px-5 font-semibold">#</th>
              <th className="text-left py-3 px-5 font-semibold">Date</th>
              <th className="text-left py-3 px-5 font-semibold">Task Details</th>
              <th className="text-left py-3 px-5 font-semibold">Status</th>
              <th className="text-left py-3 px-5 font-semibold">Checked By</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100">
              {myHomework.map((h, i) => (
                <tr key={h.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-5 text-slate-400 text-xs">{i + 1}</td>
                  <td className="py-3 px-5 text-slate-600 flex items-center gap-1.5">
                    <Calendar size={13} className="text-slate-400" /> {h.assignedDate}
                  </td>
                  <td className="py-3 px-5 text-slate-700 max-w-md">{h.taskDetails}</td>
                  <td className="py-3 px-5">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${statusStyle(h.status)}`}>
                      {statusIcon(h.status)} {statusLabel(h.status)}
                    </span>
                  </td>
                  <td className="py-3 px-5 text-slate-500 text-xs">{h.checkedByName || "—"}</td>
                </tr>
              ))}
              {myHomework.length === 0 && (
                <tr><td colSpan={5} className="py-12 text-center text-sm text-slate-400">
                  <BookOpen size={28} className="mx-auto mb-2 text-slate-300" />
                  No homework tasks assigned yet.
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
