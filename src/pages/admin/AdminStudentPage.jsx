import { useState, useEffect, useCallback, useRef } from "react";
import { GraduationCap, UserPlus, Search, Filter, Plus, X, DollarSign, Pencil, Trash2, AlertCircle, Save, QrCode, Loader2, Hash } from "lucide-react";
import { useAppContext } from "../../context/AppContext";
import { PageHeader, Card, InputField, SelectField, BranchBadge, StatusBadge, SuccessToast, EmptyState } from "../../components/shared";
import QRStickerModal from "../../components/shared/QRStickerModal";

const API = "http://localhost:8080/api/v1/admin";

const GENDER_OPTIONS = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "OTHER", label: "Other" },
];

const emptyForm = {
  fullName: "", branchId: "", username: "", password: "", email: "",
  address: "", telephone: "", birthday: "", gender: "MALE", nic: "",
};

export default function AdminStudentPage() {
  const { branches, fetchStudents: refreshGlobalStudents } = useAppContext();

  const [students, setStudents] = useState([]);
  const [loadingList, setLoadingList] = useState(false);

  const [form, setForm] = useState(emptyForm);
  const [showSuccess, setShowSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [qrStudent, setQrStudent] = useState(null);

  // NEW: live Student ID preview for the selected branch
  const [previewedId, setPreviewedId] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const abortRef = useRef(null);
  const previewAbortRef = useRef(null);

  const resetForm = () => {
    setForm({ ...emptyForm, branchId: branches[0]?.id?.toString() || "" });
    setEditingId(null);
    setShowForm(false);
    setPreviewedId(null);
  };

  const toast = (msg) => {
    setShowSuccess(msg);
    setTimeout(() => setShowSuccess(""), 3000);
  };

  const loadStudents = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoadingList(true);
    try {
      const params = new URLSearchParams();
      if (branchFilter !== "All") params.set("branchId", branchFilter);
      if (search.trim()) params.set("query", search.trim());

      const res = await fetch(`${API}/students?${params.toString()}`, { signal: controller.signal });
      if (!res.ok) throw new Error("Failed to load students");
      const data = await res.json();
      setStudents(data);
    } catch (err) {
      if (err.name !== "AbortError") toast(`Error loading students: ${err.message}`);
    } finally {
      setLoadingList(false);
    }
  }, [branchFilter, search]);

  useEffect(() => {
    const timer = setTimeout(() => { loadStudents(); }, 300);
    return () => clearTimeout(timer);
  }, [loadStudents]);

  // NEW: whenever the selected branch changes on the registration form (add mode only —
  // an existing student's ID is already fixed, so no preview needed while editing),
  // fetch the next-available Student ID for that branch.
  useEffect(() => {
    if (!showForm || editingId || !form.branchId) {
      setPreviewedId(null);
      return;
    }

    previewAbortRef.current?.abort();
    const controller = new AbortController();
    previewAbortRef.current = controller;

    setPreviewLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`${API}/students/next-id?branchId=${form.branchId}`, { signal: controller.signal });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setPreviewedId(data.nextStudentId);
      } catch (err) {
        if (err.name !== "AbortError") setPreviewedId(null);
      } finally {
        setPreviewLoading(false);
      }
    }, 200);

    return () => { clearTimeout(timer); controller.abort(); };
  }, [form.branchId, showForm, editingId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName || !form.username || !form.branchId) return;
    if (!editingId && !form.password) return;

    setSubmitting(true);
    try {
      const payload = {
        fullName: form.fullName,
        username: form.username,
        password: form.password || "unchanged",
        email: form.email || null,
        branchId: parseInt(form.branchId),
        address: form.address || null,
        telephone: form.telephone || null,
        birthday: form.birthday || null,
        gender: form.gender || null,
        nic: form.nic || null,
      };

      const url = editingId ? `${API}/students/${editingId}` : `${API}/students`;
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Operation failed");
      }

      const saved = await res.json();
      const wasNewRegistration = !editingId;

      await Promise.all([loadStudents(), refreshGlobalStudents?.()]);
      toast(wasNewRegistration ? "Student added successfully!" : "Student updated successfully!");
      resetForm();

      if (wasNewRegistration) setQrStudent(saved);
    } catch (err) {
      toast(`Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (s, e) => {
    e?.stopPropagation();
    setForm({
      fullName: s.fullName,
      branchId: s.branchId?.toString() || "",
      username: s.username,
      password: "",
      email: s.email || "",
      address: s.address || "",
      telephone: s.telephone || "",
      birthday: s.birthday || "",
      gender: s.gender || "MALE",
      nic: s.nic || "",
    });
    setEditingId(s.id);
    setShowForm(true);
    setDeleteConfirm(null);
  };

  const handleDelete = async (id, e) => {
    e?.stopPropagation();
    try {
      await fetch(`${API}/students/${id}`, { method: "DELETE" });
      await Promise.all([loadStudents(), refreshGlobalStudents?.()]);
      setDeleteConfirm(null);
      toast("Student deleted successfully!");
    } catch {
      toast("Error deleting student");
    }
  };

  const branchOptions = branches.map((b) => ({ value: b.id.toString(), label: `${b.name} (${b.duration || ""})` }));
  const branchFilterOptions = [{ value: "All", label: "All Branches" }, ...branches.map((b) => ({ value: b.id.toString(), label: b.name }))];
  const selectedBranchName = branches.find((b) => b.id.toString() === form.branchId)?.name;

  return (
    <div className="space-y-6">
      <PageHeader icon={GraduationCap} title="Student Management" subtitle="Manage all enrolled students" badge={`${students.length} shown`}>
        <button onClick={() => { if (showForm && !editingId) resetForm(); else { resetForm(); setShowForm(true); setForm(f => ({ ...f, branchId: branches[0]?.id?.toString() || "" })); } }}
          className="px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 cursor-pointer">
          {showForm && !editingId ? <X size={16} /> : <Plus size={16} />}
          {showForm && !editingId ? "Close Form" : "Add Student"}
        </button>
      </PageHeader>

      {showSuccess && <SuccessToast message={showSuccess} />}

      {showForm && (
        <Card className="p-6">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            {editingId ? <><Pencil size={18} className="text-indigo-600" /> Edit Student</> : <><UserPlus size={18} className="text-indigo-600" /> New Student Registration</>}
          </h3>

          {/* NEW: live Student ID preview — add mode only */}
          {!editingId && form.branchId && (
            <div className="mb-4 px-4 py-3 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center gap-2.5">
              <Hash size={16} className="text-indigo-500 flex-shrink-0" />
              {previewLoading ? (
                <span className="text-sm text-indigo-600 flex items-center gap-1.5">
                  <Loader2 size={13} className="animate-spin" /> Calculating next Student ID for {selectedBranchName}...
                </span>
              ) : previewedId ? (
                <span className="text-sm text-indigo-700">
                  Next Student ID for <span className="font-semibold">{selectedBranchName}</span>: <span className="font-mono font-bold">{previewedId}</span>
                  <span className="text-indigo-400 ml-1.5">(auto-assigned on save)</span>
                </span>
              ) : (
                <span className="text-sm text-indigo-400">Select a branch to preview the Student ID</span>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField label="Full Name" value={form.fullName} onChange={(v) => setForm({ ...form, fullName: v })} placeholder="Enter student's full name" />
            <SelectField label="Branch" value={form.branchId} onChange={(v) => setForm({ ...form, branchId: v })} options={branchOptions} />

            <InputField label="Address" value={form.address} onChange={(v) => setForm({ ...form, address: v })} placeholder="Enter home address" />
            <InputField label="Telephone Number" value={form.telephone} onChange={(v) => setForm({ ...form, telephone: v })} placeholder="e.g., 077 123 4567" />

            <InputField label="Birthday" type="date" value={form.birthday} onChange={(v) => setForm({ ...form, birthday: v })} />
            <SelectField label="Gender" value={form.gender} onChange={(v) => setForm({ ...form, gender: v })} options={GENDER_OPTIONS} />

            <InputField label="NIC" value={form.nic} onChange={(v) => setForm({ ...form, nic: v })} placeholder="e.g., 200112345678" />
            <InputField label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} placeholder="e.g., student@beeline.lk" />

            <InputField label="Assigned Username" value={form.username} onChange={(v) => setForm({ ...form, username: v })} placeholder="e.g., firstname.l" disabled={!!editingId} />
            {!editingId && (
              <InputField label="Temporary Password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} placeholder="Set a temporary password" />
            )}

            <div className="sm:col-span-2 flex gap-2">
              <button type="submit" disabled={submitting}
                className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-2 cursor-pointer">
                {editingId ? <><Save size={15} /> Update Student</> : <><UserPlus size={15} /> Add Student</>}
              </button>
              <button type="button" onClick={resetForm} className="px-5 py-2.5 bg-slate-100 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-200 transition-colors cursor-pointer">Cancel</button>
            </div>
          </form>
        </Card>
      )}

      <Card className="overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              placeholder="Search by name or Student ID (e.g., A12)..."
            />
            {loadingList && <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 animate-spin" />}
          </div>
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-slate-400" />
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              {branchFilterOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <th className="text-left py-3 px-5 font-semibold">#</th>
              <th className="text-left py-3 px-5 font-semibold">Student Name</th>
              <th className="text-left py-3 px-5 font-semibold">Student ID</th>
              <th className="text-left py-3 px-5 font-semibold">Branch</th>
              <th className="text-left py-3 px-5 font-semibold">Course Fee</th>
              <th className="text-left py-3 px-5 font-semibold">Username</th>
              <th className="text-left py-3 px-5 font-semibold">Status</th>
              <th className="text-right py-3 px-5 font-semibold">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((s, i) => (
                <tr
                  key={s.id}
                  onClick={() => setQrStudent(s)}
                  className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                  title="Click to view QR sticker"
                >
                  <td className="py-3 px-5 text-slate-400 text-xs">{i + 1}</td>
                  <td className="py-3 px-5 font-medium text-slate-800">{s.fullName}</td>
                  <td className="py-3 px-5 text-slate-500 font-mono text-xs">{s.studentIdNo}</td>
                  <td className="py-3 px-5"><BranchBadge branch={s.branchName} /></td>
                  <td className="py-3 px-5">
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-700">
                      <DollarSign size={11} className="text-emerald-500" />
                      Rs. {(s.totalFee || 0).toLocaleString()}
                    </span>
                  </td>
                  <td className="py-3 px-5 text-slate-500 font-mono text-xs">{s.username}</td>
                  <td className="py-3 px-5"><StatusBadge status={s.status === "ACTIVE" ? "Active" : s.status === "INACTIVE" ? "Inactive" : s.status} /></td>
                  <td className="py-3 px-5">
                    {deleteConfirm === s.id ? (
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <span className="text-xs text-red-600 font-medium flex items-center gap-1"><AlertCircle size={12} /> Delete?</span>
                        <button onClick={(e) => handleDelete(s.id, e)} className="px-2.5 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 cursor-pointer">Yes</button>
                        <button onClick={(e) => { e.stopPropagation(); setDeleteConfirm(null); }} className="px-2.5 py-1.5 bg-slate-100 text-slate-600 text-xs rounded-lg hover:bg-slate-200 cursor-pointer">No</button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={(e) => { e.stopPropagation(); setQrStudent(s); }} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer" title="View QR Sticker"><QrCode size={14} /></button>
                        <button onClick={(e) => startEdit(s, e)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer" title="Edit"><Pencil size={14} /></button>
                        <button onClick={(e) => { e.stopPropagation(); setDeleteConfirm(s.id); }} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer" title="Delete"><Trash2 size={14} /></button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {!loadingList && students.length === 0 && <tr><td colSpan={8}><EmptyState icon={Search} message="No students match your search." /></td></tr>}
            </tbody>
          </table>
        </div>
      </Card>

      <QRStickerModal student={qrStudent} onClose={() => setQrStudent(null)} />
    </div>
  );
}