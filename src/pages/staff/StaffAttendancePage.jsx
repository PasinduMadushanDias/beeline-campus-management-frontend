import { useState, useEffect } from "react";
import { CalendarCheck, CheckCircle2, XCircle, Filter, Plus, X, Search, Send, ScanLine } from "lucide-react";
import { useAppContext } from "../../context/AppContext";
import { useAuth } from "../../context/AuthContext";
import { PageHeader, Card, BranchBadge, MetricCard, SuccessToast } from "../../components/shared";
import QRAttendanceScanner from "../../components/shared/QRAttendanceScanner";
import { parseQrPayload } from "../../utils/qrPayload";
import { Html5Qrcode } from "html5-qrcode";
import { API_BASE_URL } from "../../config/api";

const API = API_BASE_URL;

export default function StaffAttendancePage() {
  const { branches, students, fetchStudents, attendance, fetchAttendance } = useAppContext();
  const { user } = useAuth();
  const canMark = user?.canMarkAttendance;

  const [branchFilter, setBranchFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [mode, setMode] = useState("manual"); // "manual" | "scan"
  // selectedStudentId holds the student's unique numeric id (not studentIdNo, which
  // is only unique per branch and can collide across branches in the dropdown).
  const [form, setForm] = useState({ selectedStudentId: "", date: new Date().toISOString().slice(0, 10), present: true });

  // Real students only, loaded from the database via AppContext (populated by Admin registration).
  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);
  const [submitting, setSubmitting] = useState(false);
  const [scanBusy, setScanBusy] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const params = {};
    if (branchFilter !== "All") {
      const branch = branches.find((b) => b.name === branchFilter);
      if (branch) params.branchId = branch.id;
    }
    if (dateFilter) params.date = dateFilter;
    fetchAttendance(params);
  }, [branchFilter, dateFilter, fetchAttendance, branches]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const refreshTable = () =>
    fetchAttendance(branchFilter !== "All" ? { branchId: branches.find((b) => b.name === branchFilter)?.id } : {});

  const handleMark = async (e) => {
    e.preventDefault();
    const selected = students.find((s) => String(s.id) === form.selectedStudentId);
    if (!selected || !form.date) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/attendance/mark-by-id?markedByUserId=${user.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branchId: selected.branchId,
          studentIdNo: selected.studentIdNo,
          date: form.date,
          present: form.present,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to mark attendance");
      }
      await refreshTable();
      showToast("Attendance marked successfully!");
      setForm({ selectedStudentId: "", date: new Date().toISOString().slice(0, 10), present: true });
    } catch (err) {
      showToast(`Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleScan = async (decodedText) => {
    if (scanBusy) return;

    const parsed = parseQrPayload(decodedText);
    if (!parsed) {
      showToast("Error: Unrecognized QR code");
      return;
    }

    setScanBusy(true);
    try {
      const res = await fetch(`${API}/attendance/mark-by-qr?markedByUserId=${user.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branchId: parsed.branchId,
          studentIdNo: parsed.studentIdNo,
          date: new Date().toISOString().slice(0, 10),
          present: true,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to mark attendance");
      }
      const data = await res.json();
      await refreshTable();
      showToast(`Marked present: ${data.studentName}`);
    } catch (err) {
      showToast(`Error: ${err.message}`);
    } finally {
      setScanBusy(false);
    }
  };

  const present = attendance.filter((a) => a.present).length;
  const absent = attendance.filter((a) => !a.present).length;

  return (
    <div className="space-y-6">
      <PageHeader icon={CalendarCheck} title="Attendance Logs" subtitle="View and manage student attendance records">
        {canMark && (
          <button onClick={() => setShowForm(!showForm)}
            className="px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 cursor-pointer">
            {showForm ? <X size={16} /> : <Plus size={16} />}
            {showForm ? "Close" : "Mark Attendance"}
          </button>
        )}
      </PageHeader>

      {toast && <SuccessToast message={toast} />}

      {!canMark && (
        <Card className="p-4 bg-amber-50 border-amber-200">
          <p className="text-sm text-amber-700 flex items-center gap-2">
            <XCircle size={16} /> You do not have permission to mark attendance. Contact an Admin to enable this.
          </p>
        </Card>
      )}

      {showForm && canMark && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              {mode === "manual" ? <><Send size={18} className="text-indigo-600" /> Mark Attendance by Student ID</>
                                  : <><ScanLine size={18} className="text-indigo-600" /> Scan Student QR</>}
            </h3>
            <div className="flex items-center gap-1.5 bg-slate-100 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setMode("manual")}
                className={`px-3 py-1.5 text-xs font-medium rounded-md cursor-pointer transition-colors ${
                  mode === "manual" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Manual Entry
              </button>
              <button
                type="button"
                onClick={() => setMode("scan")}
                className={`px-3 py-1.5 text-xs font-medium rounded-md cursor-pointer transition-colors flex items-center gap-1.5 ${
                  mode === "scan" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <ScanLine size={13} /> Scan QR
              </button>
            </div>
          </div>

          {mode === "manual" && (
            <form onSubmit={handleMark} className="flex flex-wrap items-end gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Student</label>
                <select value={form.selectedStudentId} onChange={(e) => setForm({ ...form, selectedStudentId: e.target.value })}
                  required
                  className="px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white w-64">
                  <option value="" disabled>Select a student...</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.studentIdNo} — {s.fullName} ({s.branchName})
                    </option>
                  ))}
                </select>
                {students.length === 0 && (
                  <p className="text-xs text-slate-400 mt-1">No students found. Add students from the Admin panel first.</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Date</label>
                <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required
                  className="px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Status</label>
                <select value={form.present} onChange={(e) => setForm({ ...form, present: e.target.value === "true" })}
                  className="px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white">
                  <option value="true">Present</option>
                  <option value="false">Absent</option>
                </select>
              </div>
              <button type="submit" disabled={submitting}
                className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-2 cursor-pointer">
                <CheckCircle2 size={15} /> Submit
              </button>
            </form>
          )}

          {mode === "scan" && (
            <div className="py-2">
              <QRAttendanceScanner active={mode === "scan"} onScan={handleScan} />
              {scanBusy && (
                <p className="text-xs text-slate-400 text-center mt-2">Marking attendance...</p>
              )}
            </div>
          )}
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard icon={CalendarCheck} label="Total Records" value={attendance.length} color="blue" />
        <MetricCard icon={CheckCircle2} label="Present" value={present} color="green" />
        <MetricCard icon={XCircle} label="Absent" value={absent} color="rose" />
      </div>

      <Card className="overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center gap-3">
          <Filter size={14} className="text-slate-400" />
          <select value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none">
            <option value="All">All Branches</option>
            {branches.map((b) => <option key={b.id} value={b.name}>{b.name}</option>)}
          </select>
          <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none" />
          {dateFilter && (
            <button onClick={() => setDateFilter("")} className="text-xs text-indigo-600 hover:underline cursor-pointer">Clear date</button>
          )}
          <span className="text-xs text-slate-400 ml-auto">{attendance.length} records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <th className="text-left py-3 px-5 font-semibold">#</th>
              <th className="text-left py-3 px-5 font-semibold">Student ID</th>
              <th className="text-left py-3 px-5 font-semibold">Student</th>
              <th className="text-left py-3 px-5 font-semibold">Branch</th>
              <th className="text-left py-3 px-5 font-semibold">Date</th>
              <th className="text-left py-3 px-5 font-semibold">Status</th>
              <th className="text-left py-3 px-5 font-semibold">Marked By</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100">
              {attendance.map((a, i) => (
                <tr key={a.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-5 text-slate-400 text-xs">{i + 1}</td>
                  <td className="py-3 px-5 font-mono text-xs text-indigo-600">{a.studentIdNo}</td>
                  <td className="py-3 px-5 font-medium text-slate-800">{a.studentName}</td>
                  <td className="py-3 px-5"><BranchBadge branch={a.branchName} /></td>
                  <td className="py-3 px-5 text-slate-600">{a.date}</td>
                  <td className="py-3 px-5">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${
                      a.present ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                    }`}>
                      {a.present ? <><CheckCircle2 size={12} /> Present</> : <><XCircle size={12} /> Absent</>}
                    </span>
                  </td>
                  <td className="py-3 px-5 text-slate-500 text-xs">{a.markedByName}</td>
                </tr>
              ))}
              {attendance.length === 0 && (
                <tr><td colSpan={7} className="py-12 text-center text-sm text-slate-400">
                  <CalendarCheck size={28} className="mx-auto mb-2 text-slate-300" />
                  No attendance records found.
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}