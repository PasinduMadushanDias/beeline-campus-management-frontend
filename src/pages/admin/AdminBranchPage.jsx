import { useState } from "react";
import {
  Settings, Building2, Plus, X, Trash2, Pencil, Save,
  DollarSign, Calendar, Eye, AlertCircle, CreditCard,
} from "lucide-react";
import { useAppContext } from "../../context/AppContext";
import { PageHeader, Card, SuccessToast } from "../../components/shared";
import { API_BASE_URL } from "../../config/api";

const API = `${API_BASE_URL}/admin`;

const BRANCH_COLORS = [
  { value: "blue", bg: "bg-blue-500", ring: "ring-blue-500" },
  { value: "teal", bg: "bg-teal-500", ring: "ring-teal-500" },
  { value: "purple", bg: "bg-purple-500", ring: "ring-purple-500" },
  { value: "amber", bg: "bg-amber-500", ring: "ring-amber-500" },
  { value: "rose", bg: "bg-rose-500", ring: "ring-rose-500" },
  { value: "emerald", bg: "bg-emerald-500", ring: "ring-emerald-500" },
  { value: "cyan", bg: "bg-cyan-500", ring: "ring-cyan-500" },
  { value: "orange", bg: "bg-orange-500", ring: "ring-orange-500" },
];

const EMPTY_FORM = {
  name: "", duration: "", schedule: "", color: "blue",
  totalFee: 45000, installmentsCount: 3, dueDayValue: "Every 5th of the month",
};

function buildInstallmentPreview(totalFee, installmentsCount) {
  if (!totalFee || !installmentsCount || installmentsCount < 1) return [];
  const base = Math.floor(totalFee / installmentsCount);
  const remainder = totalFee - base * installmentsCount;
  return Array.from({ length: installmentsCount }, (_, i) => ({
    number: i + 1,
    amount: i === 0 ? base + remainder : base,
  }));
}

export default function AdminBranchPage() {
  const { branches, fetchBranches } = useAppContext();

  const [showForm, setShowForm] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const resetForm = () => {
    setForm({ ...EMPTY_FORM });
    setEditingBranch(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.duration.trim() || !form.schedule.trim()) return;

    const payload = {
      name: form.name.trim(),
      duration: form.duration.trim(),
      schedule: form.schedule.trim(),
      color: form.color,
      totalFee: parseInt(form.totalFee) || 0,
      installmentsCount: parseInt(form.installmentsCount) || 1,
      dueDayValue: form.dueDayValue.trim() || "Every 5th of the month",
    };

    try {
      const url = editingBranch ? `${API}/branches/${editingBranch.id}` : `${API}/branches`;
      const method = editingBranch ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Operation failed");

      await fetchBranches();
      showToast(editingBranch ? "Branch updated successfully!" : "New branch added successfully!");
      resetForm();
    } catch {
      showToast("Error saving branch");
    }
  };

  const startEdit = (branch) => {
    setForm({
      name: branch.name,
      duration: branch.duration,
      schedule: branch.schedule,
      color: branch.color,
      totalFee: branch.totalFee,
      installmentsCount: branch.installmentsCount,
      dueDayValue: branch.dueDayValue,
    });
    setEditingBranch(branch);
    setShowForm(true);
    setDeleteConfirm(null);
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`${API}/branches/${id}`, { method: "DELETE" });
      await fetchBranches();
      setDeleteConfirm(null);
      showToast("Branch deleted successfully!");
    } catch {
      showToast("Error deleting branch");
    }
  };

  const preview = buildInstallmentPreview(
    parseInt(form.totalFee) || 0,
    parseInt(form.installmentsCount) || 1
  );

  return (
    <div className="space-y-8">
      <PageHeader icon={Settings} title="Branch Settings" subtitle="Manage branches with independent fee structures" />

      {toast && <SuccessToast message={toast} />}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Building2 size={18} className="text-indigo-600" />
          <h3 className="text-base font-semibold text-slate-800">Branch Management</h3>
          <span className="text-xs bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full font-medium">{branches.length} branches</span>
        </div>
        <button
          onClick={() => { if (showForm && !editingBranch) resetForm(); else { resetForm(); setShowForm(true); } }}
          className={`px-4 py-2 text-sm font-medium rounded-lg flex items-center gap-2 transition-colors cursor-pointer ${
            showForm && !editingBranch ? "bg-slate-100 text-slate-600 hover:bg-slate-200" : "bg-indigo-600 text-white hover:bg-indigo-700"
          }`}
        >
          {showForm && !editingBranch ? <><X size={15} /> Close Form</> : <><Plus size={15} /> Add New Branch</>}
        </button>
      </div>

      {showForm && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <Card className="lg:col-span-3 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-white">
              <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                {editingBranch
                  ? <><Pencil size={14} className="text-indigo-600" /> Edit Branch: {editingBranch.name}</>
                  : <><Plus size={14} className="text-indigo-600" /> Add New Branch</>}
              </h4>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">Branch Name</label>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g., Colombo" required
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">Course Duration</label>
                  <input type="text" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="e.g., 6 Months" required
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">Schedule Info</label>
                  <input type="text" value={form.schedule} onChange={(e) => setForm({ ...form, schedule: e.target.value })} placeholder="e.g., Sunday Only" required
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" />
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <CreditCard size={13} /> Fee Configuration
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">Course Fee Amount (Rs.)</label>
                    <input type="number" min="0" value={form.totalFee} onChange={(e) => setForm({ ...form, totalFee: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition bg-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">Number of Installments</label>
                    <select value={form.installmentsCount} onChange={(e) => setForm({ ...form, installmentsCount: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white transition">
                      {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} installment{n > 1 ? "s" : ""}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">Due Date / Cycle Info</label>
                    <input type="text" value={form.dueDayValue} onChange={(e) => setForm({ ...form, dueDayValue: e.target.value })} placeholder="e.g., Every 5th of the month"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">Branch Color</label>
                <div className="flex gap-2.5 flex-wrap">
                  {BRANCH_COLORS.map((c) => (
                    <button key={c.value} type="button" onClick={() => setForm({ ...form, color: c.value })}
                      className={`w-8 h-8 rounded-full ${c.bg} cursor-pointer transition-all ${form.color === c.value ? "ring-2 ring-offset-2 " + c.ring + " scale-110" : "opacity-50 hover:opacity-80"}`}
                      title={c.value.charAt(0).toUpperCase() + c.value.slice(1)} />
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button type="submit" className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 cursor-pointer">
                  {editingBranch ? <><Save size={15} /> Update Branch</> : <><Plus size={15} /> Add Branch</>}
                </button>
                <button type="button" onClick={resetForm} className="px-5 py-2.5 bg-slate-100 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-200 transition-colors cursor-pointer">Cancel</button>
              </div>
            </form>
          </Card>

          <Card className="lg:col-span-2 overflow-hidden self-start">
            <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-white">
              <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Eye size={16} className="text-emerald-600" /> Installment Preview
                <span className="ml-1 text-xs bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full font-medium animate-pulse">Live</span>
              </h4>
              {form.name && <p className="text-xs text-slate-400 mt-1">for <span className="font-medium text-slate-600">{form.name || "New Branch"}</span></p>}
            </div>
            <div className="p-4">
              {preview.length > 0 ? (
                <div className="space-y-2">
                  {preview.map((inst) => (
                    <div key={inst.number} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0">{inst.number}</span>
                        <div>
                          <p className="text-sm font-medium text-slate-800">Installment {inst.number}</p>
                          <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5"><Calendar size={10} /> {form.dueDayValue || "—"}</p>
                        </div>
                      </div>
                      <p className="text-sm font-bold text-slate-800">Rs. {inst.amount.toLocaleString()}</p>
                    </div>
                  ))}
                  <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-600">Total Course Fee</span>
                    <span className="text-xl font-bold text-indigo-600">Rs. {(parseInt(form.totalFee) || 0).toLocaleString()}</span>
                  </div>
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                    <p className="text-xs text-blue-700">
                      <span className="font-semibold">{parseInt(form.installmentsCount) || 1} installment{(parseInt(form.installmentsCount) || 1) > 1 ? "s" : ""}</span> of Rs.{" "}
                      {Math.floor((parseInt(form.totalFee) || 0) / (parseInt(form.installmentsCount) || 1)).toLocaleString()} each
                      {form.dueDayValue ? <>, due <span className="font-semibold">{form.dueDayValue}</span></> : null}.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center">
                  <AlertCircle size={28} className="text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">Enter fee details to see the breakdown</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="text-left py-3 px-5 font-semibold">#</th>
                <th className="text-left py-3 px-5 font-semibold">Branch</th>
                <th className="text-left py-3 px-5 font-semibold">Duration</th>
                <th className="text-left py-3 px-5 font-semibold">Schedule</th>
                <th className="text-left py-3 px-5 font-semibold">Course Fee</th>
                <th className="text-left py-3 px-5 font-semibold">Installments</th>
                <th className="text-left py-3 px-5 font-semibold">Due Cycle</th>
                <th className="text-right py-3 px-5 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {branches.map((b, i) => (
                <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5 px-5 text-slate-400 text-xs">{i + 1}</td>
                  <td className="py-3.5 px-5 font-medium text-slate-800">
                    <div className="flex items-center gap-2">
                      <span className={`inline-block w-3 h-3 rounded-full ${BRANCH_COLORS.find((c) => c.value === b.color)?.bg || "bg-blue-500"}`} />
                      {b.name}
                    </div>
                  </td>
                  <td className="py-3.5 px-5 text-slate-600">{b.duration}</td>
                  <td className="py-3.5 px-5 text-slate-600">{b.schedule}</td>
                  <td className="py-3.5 px-5 text-slate-700 font-medium">Rs. {(b.totalFee || 0).toLocaleString()}</td>
                  <td className="py-3.5 px-5 text-slate-600">
                    <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                      {b.installmentsCount}x Rs. {Math.floor((b.totalFee || 0) / (b.installmentsCount || 1)).toLocaleString()}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-slate-500 text-xs">{b.dueDayValue}</td>
                  <td className="py-3.5 px-5">
                    {deleteConfirm === b.id ? (
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-xs text-red-600 font-medium flex items-center gap-1"><AlertCircle size={12} /> Delete?</span>
                        <button onClick={() => handleDelete(b.id)} className="px-2.5 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 cursor-pointer transition-colors">Yes</button>
                        <button onClick={() => setDeleteConfirm(null)} className="px-2.5 py-1.5 bg-slate-100 text-slate-600 text-xs rounded-lg hover:bg-slate-200 cursor-pointer transition-colors">No</button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => startEdit(b)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer" title="Edit"><Pencil size={14} /></button>
                        <button onClick={() => setDeleteConfirm(b.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer" title="Delete"><Trash2 size={14} /></button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {branches.length === 0 && (
                <tr><td colSpan={8}>
                  <div className="p-12 text-center">
                    <Building2 size={36} className="text-slate-300 mx-auto mb-3" />
                    <p className="text-sm text-slate-400">No branches configured yet.</p>
                    <p className="text-xs text-slate-300 mt-1">Click "Add New Branch" to get started.</p>
                  </div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
