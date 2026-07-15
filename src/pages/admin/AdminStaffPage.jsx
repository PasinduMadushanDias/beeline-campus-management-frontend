import { useState } from "react";
import { Users, Plus, X, Pencil, Trash2, AlertCircle, Save, Search } from "lucide-react";
import { useAppContext } from "../../context/AppContext";
import { PageHeader, Card, InputField, SelectField, BranchBadge, StatusBadge, SuccessToast, EmptyState } from "../../components/shared";
import { API_BASE_URL } from "../../config/api";

const API = `${API_BASE_URL}/admin`;

export default function AdminStaffPage() {
  const { staffMembers, branches, fetchStaff } = useAppContext();
  const [form, setForm] = useState({ fullName: "", role: "TEACHER", branchIds: [], email: "", username: "", password: "" });
  const [showSuccess, setShowSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");

  const resetForm = () => {
    setForm({ fullName: "", role: "TEACHER", branchIds: [], email: "", username: "", password: "" });
    setEditingId(null);
    setShowForm(false);
  };

  const toast = (msg) => {
    setShowSuccess(msg);
    setTimeout(() => setShowSuccess(""), 3000);
  };

  const toggleBranch = (id) => {
    setForm((f) => ({
      ...f,
      branchIds: f.branchIds.includes(id)
        ? f.branchIds.filter((b) => b !== id)
        : [...f.branchIds, id],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName || !form.branchIds.length) return;
    if (!editingId && (!form.username || !form.password)) return;

    setSubmitting(true);
    try {
      const payload = {
        fullName: form.fullName,
        username: form.username,
        password: form.password || "unchanged",
        email: form.email || null,
        role: form.role,
        branchIds: form.branchIds,
      };

      const url = editingId ? `${API}/staff/${editingId}` : `${API}/staff`;
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

      await fetchStaff();
      toast(editingId ? "Staff member updated successfully!" : "Staff member added successfully!");
      resetForm();
    } catch (err) {
      toast(`Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (s) => {
    setForm({
      fullName: s.fullName,
      role: s.role,
      branchIds: (s.branches || []).map((b) => b.id),
      email: s.email || "",
      username: s.username,
      password: "",
    });
    setEditingId(s.id);
    setShowForm(true);
    setDeleteConfirm(null);
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`${API}/staff/${id}`, { method: "DELETE" });
      await fetchStaff();
      setDeleteConfirm(null);
      toast("Staff member deleted successfully!");
    } catch {
      toast("Error deleting staff member");
    }
  };

  const togglePermission = async (staffId, current) => {
    try {
      const res = await fetch(`${API}/staff/${staffId}/attendance-permission`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ canMarkAttendance: !current }),
      });
      if (res.ok) {
        await fetchStaff();
        toast(`Attendance permission ${!current ? "granted" : "revoked"}`);
      }
    } catch {
      toast("Error updating permission");
    }
  };

  const filtered = staffMembers.filter((s) =>
    (s.fullName || "").toLowerCase().includes(search.toLowerCase()) ||
    (s.username || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader icon={Users} title="Staff Management" subtitle="Teachers and support staff" badge={`${staffMembers.length} members`}>
        <button onClick={() => { if (showForm && !editingId) resetForm(); else { resetForm(); setShowForm(true); } }}
          className="px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 cursor-pointer">
          {showForm && !editingId ? <X size={16} /> : <Plus size={16} />}
          {showForm && !editingId ? "Close" : "Add Staff"}
        </button>
      </PageHeader>

      {showSuccess && <SuccessToast message={showSuccess} />}

      {showForm && (
        <Card className="p-6">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            {editingId ? <><Pencil size={18} className="text-indigo-600" /> Edit Staff Member</> : <><Plus size={18} className="text-indigo-600" /> Add New Staff Member</>}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField label="Full Name" value={form.fullName} onChange={(v) => setForm({ ...form, fullName: v })} placeholder="e.g., Ms. Kumari Perera" />
            <InputField label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} placeholder="e.g., kumari@beeline.lk" />
            <SelectField label="Role" value={form.role} onChange={(v) => setForm({ ...form, role: v })}
              options={[{ value: "TEACHER", label: "Teacher" }, { value: "STAFF", label: "Staff" }]} />

            {/* Multi-select branch picker */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Assigned Branches</label>
              <div className="flex flex-wrap gap-2 p-3 border border-slate-300 rounded-lg min-h-[42px] bg-white">
                {branches.map((b) => {
                  const selected = form.branchIds.includes(b.id);
                  return (
                    <button key={b.id} type="button" onClick={() => toggleBranch(b.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        selected
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}>
                      {b.name}
                      {selected && <span className="ml-1.5">×</span>}
                    </button>
                  );
                })}
                {branches.length === 0 && <span className="text-xs text-slate-400">No branches available</span>}
              </div>
              {form.branchIds.length === 0 && <p className="text-xs text-amber-600 mt-1">Select at least one branch</p>}
            </div>

            {!editingId && (
              <>
                <InputField label="Assigned Username" value={form.username} onChange={(v) => setForm({ ...form, username: v })} placeholder="e.g., firstname.l" />
                <InputField label="Temporary Password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} placeholder="Set a temporary password" />
              </>
            )}

            <div className="sm:col-span-2 flex gap-2">
              <button type="submit" disabled={submitting}
                className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-2 cursor-pointer">
                {editingId ? <><Save size={15} /> Update Member</> : <><Plus size={15} /> Add Member</>}
              </button>
              <button type="button" onClick={resetForm} className="px-5 py-2.5 bg-slate-100 text-slate-600 text-sm rounded-lg hover:bg-slate-200 cursor-pointer">Cancel</button>
            </div>
          </form>
        </Card>
      )}

      <Card className="overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" placeholder="Search staff..." />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <th className="text-left py-3 px-5 font-semibold">#</th>
              <th className="text-left py-3 px-5 font-semibold">Name</th>
              <th className="text-left py-3 px-5 font-semibold">Role</th>
              <th className="text-left py-3 px-5 font-semibold">Branches</th>
              <th className="text-left py-3 px-5 font-semibold">Email</th>
              <th className="text-left py-3 px-5 font-semibold">Status</th>
              <th className="text-center py-3 px-5 font-semibold">Attendance</th>
              <th className="text-right py-3 px-5 font-semibold">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((s, i) => (
                <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-5 text-slate-400 text-xs">{i + 1}</td>
                  <td className="py-3 px-5 font-medium text-slate-800">{s.fullName}</td>
                  <td className="py-3 px-5">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      s.role === "TEACHER" ? "bg-purple-50 text-purple-700" : "bg-blue-50 text-blue-700"
                    }`}>
                      {s.role === "TEACHER" ? "Teacher" : "Staff"}
                    </span>
                  </td>
                  <td className="py-3 px-5">
                    <div className="flex flex-wrap gap-1">
                      {(s.branches || []).map((b) => (
                        <BranchBadge key={b.id} branch={b.name} />
                      ))}
                      {(!s.branches || s.branches.length === 0) && <span className="text-xs text-slate-400">—</span>}
                    </div>
                  </td>
                  <td className="py-3 px-5 text-slate-500 text-xs">{s.email}</td>
                  <td className="py-3 px-5"><StatusBadge status={s.status === "ACTIVE" ? "Active" : s.status === "ON_LEAVE" ? "On Leave" : s.status} /></td>
                  <td className="py-3 px-5 text-center">
                    <button onClick={() => togglePermission(s.id, s.canMarkAttendance)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                        s.canMarkAttendance ? "bg-emerald-500" : "bg-slate-300"
                      }`}>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        s.canMarkAttendance ? "translate-x-6" : "translate-x-1"
                      }`} />
                    </button>
                  </td>
                  <td className="py-3 px-5">
                    {deleteConfirm === s.id ? (
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-xs text-red-600 font-medium flex items-center gap-1"><AlertCircle size={12} /> Delete?</span>
                        <button onClick={() => handleDelete(s.id)} className="px-2.5 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 cursor-pointer">Yes</button>
                        <button onClick={() => setDeleteConfirm(null)} className="px-2.5 py-1.5 bg-slate-100 text-slate-600 text-xs rounded-lg hover:bg-slate-200 cursor-pointer">No</button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => startEdit(s)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer" title="Edit"><Pencil size={14} /></button>
                        <button onClick={() => setDeleteConfirm(s.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer" title="Delete"><Trash2 size={14} /></button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={8}><EmptyState icon={Search} message="No staff members found." /></td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
