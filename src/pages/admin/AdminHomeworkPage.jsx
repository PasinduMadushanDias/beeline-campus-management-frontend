import { useState, useEffect } from "react";
import { BookOpen, Plus, X, Send, Filter, Calendar, Trash2, Pencil, AlertTriangle } from "lucide-react";
import { useAppContext } from "../../context/AppContext";
import { PageHeader, Card, BranchBadge, SuccessToast, EmptyState } from "../../components/shared";

const API = "http://localhost:8080/api/v1";

export default function AdminHomeworkPage() {
  const { branches, homeworkTasks, fetchHomeworkTasks } = useAppContext();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null); // null = create mode, otherwise id being edited
  const [branchId, setBranchId] = useState("");
  const [assignedDate, setAssignedDate] = useState(new Date().toISOString().slice(0, 10));
  const [tasks, setTasks] = useState([""]);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState("");
  const [branchFilter, setBranchFilter] = useState("All");
  const [deleteTarget, setDeleteTarget] = useState(null); // task object pending delete confirmation
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchHomeworkTasks();
  }, [fetchHomeworkTasks]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const addTask = () => setTasks([...tasks, ""]);

  const removeTask = (idx) => {
    if (tasks.length === 1) return;
    setTasks(tasks.filter((_, i) => i !== idx));
  };

  const updateTask = (idx, value) => {
    setTasks(tasks.map((t, i) => i === idx ? value : t));
  };

  const resetForm = () => {
    setEditingId(null);
    setBranchId("");
    setAssignedDate(new Date().toISOString().slice(0, 10));
    setTasks([""]);
  };

  const openCreateForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (task) => {
    setEditingId(task.id);
    // find branch id by matching name, since the table row only stores branchName
    const matchedBranch = branches.find((b) => b.name === task.branchName);
    setBranchId(matchedBranch ? String(matchedBranch.id) : "");
    setAssignedDate(task.assignedDate);
    // taskDetails is stored as a comma-separated string of individual tasks
    const splitTasks = task.taskDetails.split(",").map((t) => t.trim()).filter(Boolean);
    setTasks(splitTasks.length ? splitTasks : [""]);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validTasks = tasks.map((t) => t.trim()).filter(Boolean);
    if (!branchId || !assignedDate || validTasks.length === 0) return;
    setSubmitting(true);
    try {
      const isEditing = Boolean(editingId);
      const url = isEditing ? `${API}/homework/${editingId}` : `${API}/homework/assign`;
      const res = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ branchId: Number(branchId), assignedDate, tasks: validTasks }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Failed to ${isEditing ? "update" : "assign"} homework`);
      }
      await fetchHomeworkTasks();
      showToast(isEditing
        ? "Homework updated successfully!"
        : `${validTasks.length} homework task(s) assigned successfully!`);
      closeForm();
    } catch (err) {
      showToast(`Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API}/homework/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to delete homework");
      }
      await fetchHomeworkTasks();
      showToast("Homework task deleted.");
      setDeleteTarget(null);
    } catch (err) {
      showToast(`Error: ${err.message}`);
    } finally {
      setDeleting(false);
    }
  };

  const filtered = branchFilter === "All"
    ? homeworkTasks
    : homeworkTasks.filter((t) => t.branchName === branchFilter);

  return (
    <div className="space-y-6">
      <PageHeader icon={BookOpen} title="Homework Management" subtitle="Assign daily homework tasks to branches" badge={`${homeworkTasks.length} tasks`}>
        <button onClick={() => (showForm ? closeForm() : openCreateForm())}
          className="px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 cursor-pointer">
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? "Close" : "Assign Homework"}
        </button>
      </PageHeader>

      {toast && <SuccessToast message={toast} />}

      {showForm && (
        <Card className="p-6">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Send size={18} className="text-indigo-600" />
            {editingId ? "Edit Homework Tasks" : "Assign New Homework Tasks"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Branch</label>
                <select value={branchId} onChange={(e) => setBranchId(e.target.value)} required
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white">
                  <option value="">Select a branch</option>
                  {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Date</label>
                <input type="date" value={assignedDate} onChange={(e) => setAssignedDate(e.target.value)} required
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-slate-600">Tasks</label>
                <button type="button" onClick={addTask}
                  className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-medium rounded-lg hover:bg-indigo-100 transition-colors flex items-center gap-1 cursor-pointer">
                  <Plus size={12} /> Add Task
                </button>
              </div>
              <div className="space-y-2">
                {tasks.map((task, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 w-6 text-right shrink-0">{idx + 1}.</span>
                    <input
                      type="text"
                      value={task}
                      onChange={(e) => updateTask(idx, e.target.value)}
                      placeholder={`e.g., Chatterbox step ${idx + 1}`}
                      required
                      className="flex-1 px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    />
                    {tasks.length > 1 && (
                      <button type="button" onClick={() => removeTask(idx)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-1.5">Each task will be tracked individually per student.</p>
            </div>

            <div className="flex gap-2">
              <button type="submit" disabled={submitting}
                className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-2 cursor-pointer">
                {editingId ? <Pencil size={15} /> : <Plus size={15} />}
                {submitting
                  ? (editingId ? "Saving..." : "Assigning...")
                  : editingId
                    ? "Save Changes"
                    : `Assign ${tasks.filter((t) => t.trim()).length} Task(s)`}
              </button>
              <button type="button" onClick={closeForm}
                className="px-5 py-2.5 bg-slate-100 text-slate-600 text-sm rounded-lg hover:bg-slate-200 cursor-pointer">Cancel</button>
            </div>
          </form>
        </Card>
      )}

      <Card className="overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center gap-3">
          <Filter size={14} className="text-slate-400" />
          <select value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none">
            <option value="All">All Branches</option>
            {branches.map((b) => <option key={b.id} value={b.name}>{b.name}</option>)}
          </select>
          <span className="text-xs text-slate-400 ml-auto">{filtered.length} tasks</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <th className="text-left py-3 px-5 font-semibold">#</th>
              <th className="text-left py-3 px-5 font-semibold">Branch</th>
              <th className="text-left py-3 px-5 font-semibold">Date</th>
              <th className="text-left py-3 px-5 font-semibold">Task Details</th>
              <th className="text-right py-3 px-5 font-semibold">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((t, i) => (
                <tr key={t.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-5 text-slate-400 text-xs">{i + 1}</td>
                  <td className="py-3 px-5"><BranchBadge branch={t.branchName} /></td>
                  <td className="py-3 px-5 text-slate-600 flex items-center gap-1.5">
                    <Calendar size={13} className="text-slate-400" /> {t.assignedDate}
                  </td>
                  <td className="py-3 px-5 text-slate-700 max-w-md">{t.taskDetails}</td>
                  <td className="py-3 px-5">
                    <div className="flex items-center justify-end gap-3">
                      <button onClick={() => openEditForm(t)} title="Edit"
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => setDeleteTarget(t)} title="Delete"
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5}><EmptyState icon={BookOpen} message="No homework tasks assigned yet." /></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {deleteTarget && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-sm p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-red-50 rounded-lg shrink-0">
                <AlertTriangle size={18} className="text-red-500" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">Delete homework task?</h3>
                <p className="text-sm text-slate-500 mt-1">
                  This will remove the homework assigned to <span className="font-medium text-slate-700">{deleteTarget.branchName}</span> on{" "}
                  <span className="font-medium text-slate-700">{deleteTarget.assignedDate}</span>. This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setDeleteTarget(null)} disabled={deleting}
                className="px-4 py-2 bg-slate-100 text-slate-600 text-sm rounded-lg hover:bg-slate-200 cursor-pointer disabled:opacity-50">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 cursor-pointer">
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}