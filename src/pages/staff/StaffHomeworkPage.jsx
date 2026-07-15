import { useState, useEffect, useCallback } from "react";
import { ClipboardCheck, Save, Calendar, BookOpen, CheckCircle2, XCircle, Clock, Search, User, ArrowLeft, ScanLine } from "lucide-react";
import { useAppContext } from "../../context/AppContext";
import { useAuth } from "../../context/AuthContext";
import { PageHeader, Card, BranchBadge, SuccessToast, EmptyState, MetricCard } from "../../components/shared";
import QRAttendanceScanner from "../../components/shared/QRAttendanceScanner";
import { parseQrPayload } from "../../utils/qrPayload";

const API = "http://localhost:8080/api/v1";

export default function StaffHomeworkPage() {
  const { fetchHomeworkByBranchDate } = useAppContext();
  const { user } = useAuth();

  const staffBranches = user?.branches || [];
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [tasksData, setTasksData] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [loaded, setLoaded] = useState(false);

  const [searchMode, setSearchMode] = useState("id"); // "id" | "scan"
  const [searchId, setSearchId] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [taskStatuses, setTaskStatuses] = useState([]);
  const [prevTaskStatuses, setPrevTaskStatuses] = useState([]);
  const [savingSearch, setSavingSearch] = useState(false);
  const [scanBusy, setScanBusy] = useState(false);

  useEffect(() => {
    if (staffBranches.length === 1 && !selectedBranch) {
      setSelectedBranch(String(staffBranches[0].id));
    }
  }, [staffBranches, selectedBranch]);

  const loadData = useCallback(async () => {
    if (!selectedBranch || !selectedDate) return;
    setLoaded(false);
    const result = await fetchHomeworkByBranchDate(selectedBranch, selectedDate);
    setTasksData(result.tasks || []);
    setSubmissions(result.submissions || []);
    setLoaded(true);
  }, [selectedBranch, selectedDate, fetchHomeworkByBranchDate]);

  useEffect(() => {
    if (selectedBranch && selectedDate) loadData();
  }, [selectedBranch, selectedDate, loadData]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const runSearch = async (branchId, studentIdNo) => {
    setSearchError("");
    setSearchResult(null);
    setTaskStatuses([]);
    setPrevTaskStatuses([]);
    try {
      const res = await fetch(`${API}/homework/search-student?branchId=${branchId}&studentIdNo=${encodeURIComponent(studentIdNo)}&date=${selectedDate}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Student not found");
      }
      const data = await res.json();
      setSearchResult(data);
      setTaskStatuses(
        (data.taskSubmissions || []).map((ts) => ({
          ...ts,
          _dirty: false,
        }))
      );
      setPrevTaskStatuses(
        (data.previousIncomplete || []).map((ts) => ({
          ...ts,
          _dirty: false,
        }))
      );
      return data;
    } catch (err) {
      setSearchError(err.message);
      return null;
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchId.trim()) return;
    if (!selectedBranch) {
      setSearchError("Select a branch first.");
      return;
    }
    setSearchLoading(true);
    await runSearch(selectedBranch, searchId.trim());
    setSearchLoading(false);
  };

  const handleScan = async (decodedText) => {
    if (scanBusy) return;
    const parsed = parseQrPayload(decodedText);
    if (!parsed) {
      showToast("Error: Unrecognized QR code");
      return;
    }
    setScanBusy(true);
    const data = await runSearch(parsed.branchId, parsed.studentIdNo);
    if (data) {
      setSelectedBranch(String(parsed.branchId));
      showToast(`Loaded homework for ${data.studentName}`);
    }
    setScanBusy(false);
  };

  const updateTaskStatus = (idx, newStatus) => {
    setTaskStatuses((prev) =>
      prev.map((ts, i) => i === idx ? { ...ts, status: newStatus, _dirty: true } : ts)
    );
  };

  const updatePrevTaskStatus = (idx, newStatus) => {
    setPrevTaskStatuses((prev) =>
      prev.map((ts, i) => i === idx ? { ...ts, status: newStatus, _dirty: true } : ts)
    );
  };

  const handleSaveTaskStatuses = async () => {
    const dirty = [...taskStatuses, ...prevTaskStatuses].filter((ts) => ts._dirty && ts.submissionId);
    if (!dirty.length) return;
    setSavingSearch(true);
    try {
      const res = await fetch(`${API}/homework/submit-status?checkedByUserId=${user.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          updates: dirty.map((ts) => ({ submissionId: ts.submissionId, status: ts.status })),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to save");
      }
      showToast(`${dirty.length} task(s) updated for ${searchResult.studentName}!`);
      setTaskStatuses((prev) => prev.map((ts) => ({ ...ts, _dirty: false })));
      setPrevTaskStatuses((prev) => prev.filter((ts) => ts.status === "INCOMPLETE").map((ts) => ({ ...ts, _dirty: false })));
    } catch (err) {
      showToast(`Error: ${err.message}`);
    } finally {
      setSavingSearch(false);
    }
  };

  const clearSearch = () => {
    setSearchResult(null);
    setSearchId("");
    setSearchError("");
    setTaskStatuses([]);
    setPrevTaskStatuses([]);
    setSearchMode("id");
  };

  const submitted = submissions.filter((s) => s.status === "SUBMITTED").length;
  const incomplete = submissions.filter((s) => s.status === "INCOMPLETE").length;
  const pending = submissions.filter((s) => s.status === "PENDING").length;
  const hasDirtyTasks = taskStatuses.some((ts) => ts._dirty) || prevTaskStatuses.some((ts) => ts._dirty);

  const statusStyle = (status) =>
    status === "SUBMITTED" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
    status === "INCOMPLETE" ? "bg-red-50 text-red-700 border-red-200" :
    "bg-amber-50 text-amber-700 border-amber-200";

  return (
    <div className="space-y-6">
      <PageHeader icon={ClipboardCheck} title="Homework Collection" subtitle="Search students and evaluate individual tasks" />

      {toast && <SuccessToast message={toast} />}

      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-slate-600">Find Student</span>
          <div className="flex items-center gap-1.5 bg-slate-100 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setSearchMode("id")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md cursor-pointer transition-colors ${
                searchMode === "id" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Student ID
            </button>
            <button
              type="button"
              onClick={() => setSearchMode("scan")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md cursor-pointer transition-colors flex items-center gap-1.5 ${
                searchMode === "scan" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <ScanLine size={13} /> Scan QR
            </button>
          </div>
        </div>

        {searchMode === "id" && (
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[240px]">
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Branch</label>
              <select value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)}
                className="px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white w-full">
                <option value="">Select branch</option>
                {staffBranches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div className="flex-1 min-w-[240px]">
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Search Student by ID</label>
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                    placeholder="Enter Student ID (e.g., A01)"
                    className="w-full pl-9 pr-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                </div>
                <button type="submit" disabled={searchLoading || !searchId.trim()}
                  className="px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-2 cursor-pointer">
                  <Search size={14} /> Search
                </button>
              </form>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Date</label>
              <input type="date" value={selectedDate} onChange={(e) => { setSelectedDate(e.target.value); if (searchResult) clearSearch(); }}
                className="px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
            </div>
          </div>
        )}

        {searchMode === "scan" && (
          <div className="space-y-4">
            <div className="max-w-xs">
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Date</label>
              <input type="date" value={selectedDate} onChange={(e) => { setSelectedDate(e.target.value); if (searchResult) clearSearch(); }}
                className="px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none w-full" />
            </div>
            <div className="py-2">
              <QRAttendanceScanner active={searchMode === "scan"} onScan={handleScan} />
              {scanBusy && (
                <p className="text-xs text-slate-400 text-center mt-2">Looking up student...</p>
              )}
            </div>
          </div>
        )}
      </Card>

      {searchError && (
        <Card className="p-5 bg-red-50 border-red-200">
          <p className="text-sm text-red-700 flex items-center gap-2">
            <XCircle size={16} /> {searchError}
          </p>
        </Card>
      )}

      {searchResult && (
        <>
          {!searchResult.attendanceMarked && (
            <Card className="p-4 bg-amber-50 border-amber-200">
              <p className="text-sm text-amber-700 flex items-center gap-2">
                <Clock size={16} /> Attendance has not been marked for this student on {searchResult.date}. Mark attendance before updating homework status.
              </p>
            </Card>
          )}

          <Card className="p-5 bg-indigo-50 border-indigo-200">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <User size={20} className="text-indigo-600 mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-semibold text-indigo-900 text-sm">
                    {searchResult.studentName}
                    <span className="ml-2 font-mono text-xs text-indigo-500">{searchResult.studentIdNo}</span>
                  </h3>
                  <p className="text-xs text-indigo-600 mt-0.5 flex items-center gap-2">
                    <BranchBadge branch={searchResult.branchName} />
                    <span className="flex items-center gap-1"><Calendar size={12} /> {searchResult.date}</span>
                  </p>
                </div>
              </div>
              <button onClick={clearSearch}
                className="px-3 py-1.5 bg-indigo-100 text-indigo-700 text-xs rounded-lg hover:bg-indigo-200 transition-colors flex items-center gap-1 cursor-pointer">
                <ArrowLeft size={12} /> Clear
              </button>
            </div>
          </Card>

          {prevTaskStatuses.length > 0 && (
            <Card className="overflow-hidden border-red-200">
              <div className="p-4 border-b border-red-100 bg-red-50/50 flex items-center gap-2">
                <XCircle size={16} className="text-red-500" />
                <span className="text-sm font-medium text-red-700">
                  {prevTaskStatuses.length} previous incomplete task(s) from earlier dates
                </span>
              </div>
              <div className="divide-y divide-slate-100">
                {prevTaskStatuses.map((ts, idx) => (
                  <div key={ts.submissionId} className={`p-4 flex items-center justify-between gap-4 ${ts._dirty ? "bg-amber-50/40" : ""}`}>
                    <div className="flex items-start gap-3 flex-1">
                      <Calendar size={13} className="text-slate-400 mt-1 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-slate-800">{ts.taskDetails}</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Assigned {ts.assignedDate}
                          {ts.checkedByName && <> · Checked by {ts.checkedByName}</>}
                        </p>
                      </div>
                    </div>
                    <select value={ts.status} onChange={(e) => updatePrevTaskStatus(idx, e.target.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border outline-none cursor-pointer ${statusStyle(ts.status)}`}>
                      <option value="SUBMITTED">Complete</option>
                      <option value="INCOMPLETE">Incomplete</option>
                    </select>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {taskStatuses.length > 0 ? (
            <Card className="overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">{taskStatuses.length} task(s) assigned for {searchResult.date}</span>
                <button onClick={handleSaveTaskStatuses} disabled={savingSearch || !hasDirtyTasks}
                  className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-2 cursor-pointer">
                  <Save size={14} /> Save Changes
                </button>
              </div>
              <div className="divide-y divide-slate-100">
                {taskStatuses.map((ts, idx) => (
                  <div key={ts.homeworkTaskId} className={`p-4 flex items-center justify-between gap-4 ${ts._dirty ? "bg-amber-50/40" : ""}`}>
                    <div className="flex items-start gap-3 flex-1">
                      <span className="text-xs text-slate-400 mt-1 w-5 text-right shrink-0">{idx + 1}.</span>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{ts.taskDetails}</p>
                        {ts.checkedByName && (
                          <p className="text-xs text-slate-400 mt-0.5">Checked by {ts.checkedByName}</p>
                        )}
                      </div>
                    </div>
                    <select value={ts.status} onChange={(e) => updateTaskStatus(idx, e.target.value)}
                      disabled={!searchResult.attendanceMarked}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${statusStyle(ts.status)}`}>
                      <option value="PENDING">Pending</option>
                      <option value="SUBMITTED">Complete</option>
                      <option value="INCOMPLETE">Incomplete</option>
                    </select>
                  </div>
                ))}
              </div>
            </Card>
          ) : (
            <Card className="p-8 text-center">
              <BookOpen size={32} className="mx-auto mb-3 text-slate-300" />
              <p className="text-sm text-slate-500">No homework tasks assigned for this date.</p>
              {prevTaskStatuses.length > 0 && (
                <button onClick={handleSaveTaskStatuses} disabled={savingSearch || !hasDirtyTasks}
                  className="mt-4 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors inline-flex items-center gap-2 cursor-pointer">
                  <Save size={14} /> Save Changes
                </button>
              )}
            </Card>
          )}
        </>
      )}

      {!searchResult && (
        <>
          <Card className="p-4">
            <div className="flex flex-wrap items-end gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Branch Overview</label>
                <select value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)}
                  className="px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white min-w-[160px]">
                  <option value="">Select branch</option>
                  {staffBranches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
            </div>
          </Card>

          {loaded && tasksData.length > 0 && (
            <>
              <Card className="p-5 bg-indigo-50 border-indigo-200">
                <div className="flex items-start gap-3">
                  <BookOpen size={20} className="text-indigo-600 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-indigo-900 text-sm flex items-center gap-2">
                      Tasks for {selectedDate} <BranchBadge branch={tasksData[0]?.branchName} />
                    </h3>
                    <ul className="mt-2 space-y-1">
                      {tasksData.map((t, i) => (
                        <li key={t.id} className="text-sm text-indigo-800 flex items-center gap-2">
                          <span className="text-xs text-indigo-400">{i + 1}.</span> {t.taskDetails}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <MetricCard icon={CheckCircle2} label="Complete" value={submitted} color="green" />
                <MetricCard icon={XCircle} label="Incomplete" value={incomplete} color="rose" />
                <MetricCard icon={Clock} label="Pending" value={pending} color="amber" />
              </div>

              <Card className="p-5 bg-slate-50 border-slate-200">
                <p className="text-sm text-slate-600 flex items-center gap-2">
                  <Search size={14} className="text-slate-400" />
                  Use the <strong>Search Student by ID</strong> field above to evaluate individual tasks per student.
                </p>
              </Card>
            </>
          )}

          {loaded && tasksData.length === 0 && selectedBranch && (
            <Card className="p-8 text-center">
              <BookOpen size={32} className="mx-auto mb-3 text-slate-300" />
              <p className="text-sm text-slate-500">No homework tasks assigned for this branch on {selectedDate}.</p>
              <p className="text-xs text-slate-400 mt-1">Ask an Admin to assign homework first.</p>
            </Card>
          )}

          {!loaded && !selectedBranch && (
            <Card className="p-8 text-center">
              <ClipboardCheck size={32} className="mx-auto mb-3 text-slate-300" />
              <p className="text-sm text-slate-500">Select a branch to view homework overview, or search a student by ID to evaluate tasks.</p>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
