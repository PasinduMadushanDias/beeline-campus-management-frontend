import { useState } from "react";
import { Calendar, Clock } from "lucide-react";
import { GALLE_SCHEDULE, MATARA_SCHEDULE } from "../../constants";
import { PageHeader, Card } from "../../components/shared";

export default function TeacherSchedulePage() {
  const [branch, setBranch] = useState("Galle");
  const schedule = branch === "Galle" ? GALLE_SCHEDULE : MATARA_SCHEDULE;

  return (
    <div className="space-y-6">
      <PageHeader icon={Calendar} title="Class Schedule" subtitle="Weekly teaching timetable">
        <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
          {["Galle", "Matara"].map((b) => (
            <button key={b} onClick={() => setBranch(b)} className={`px-4 py-1.5 text-sm rounded-md font-medium transition-colors cursor-pointer ${branch === b ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>{b}</button>
          ))}
        </div>
      </PageHeader>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <th className="text-left py-3 px-5 font-semibold">Day</th>
              <th className="text-left py-3 px-5 font-semibold">Time</th>
              <th className="text-left py-3 px-5 font-semibold">Subject</th>
              <th className="text-left py-3 px-5 font-semibold">Teacher</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100">
              {schedule.map((s, i) => (
                <tr key={i} className="hover:bg-slate-50/50">
                  <td className="py-3 px-5 font-medium text-slate-800">{s.day}</td>
                  <td className="py-3 px-5 text-slate-600 flex items-center gap-1.5"><Clock size={13} className="text-slate-400" />{s.time}</td>
                  <td className="py-3 px-5 text-slate-700">{s.subject}</td>
                  <td className="py-3 px-5 text-slate-500">{s.teacher}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
