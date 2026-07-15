import { useState } from "react";
import { Megaphone, Plus, X, Send } from "lucide-react";
import { useAppContext } from "../../context/AppContext";
import { PageHeader, Card, InputField, SelectField, BranchBadge, SuccessToast } from "../../components/shared";
import { formatDate } from "../../utils/formatters";

export default function TeacherAnnouncementPage() {
  const { announcements, setAnnouncements, branches } = useAppContext();
  const [form, setForm] = useState({ title: "", content: "", branch: "Both" });
  const [showForm, setShowForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!form.title || !form.content) return;
    setAnnouncements((prev) => [{ id: Date.now(), ...form, date: new Date().toISOString(), author: "Teacher" }, ...prev]);
    setForm({ title: "", content: "", branch: "Both" });
    setShowSuccess(true);
    setShowForm(false);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const branchOptions = [{ value: "Both", label: "All Branches" }, ...branches.map((b) => ({ value: b.name, label: b.name }))];

  return (
    <div className="space-y-6">
      <PageHeader icon={Megaphone} title="Announcements" subtitle="Post and manage announcements" badge={`${announcements.length} posted`}>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 cursor-pointer">
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? "Close" : "New Post"}
        </button>
      </PageHeader>

      {showSuccess && <SuccessToast message="Announcement posted!" />}

      {showForm && (
        <Card className="p-6">
          <form onSubmit={handleAdd} className="space-y-4">
            <InputField label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} placeholder="Announcement title" />
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Content</label>
              <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={3} placeholder="Write your announcement..." className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition" />
            </div>
            <SelectField label="Target Branch" value={form.branch} onChange={(v) => setForm({ ...form, branch: v })} options={branchOptions} />
            <button type="submit" className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 flex items-center gap-2 cursor-pointer"><Send size={15} /> Post Announcement</button>
          </form>
        </Card>
      )}

      <div className="space-y-3">
        {announcements.map((a) => (
          <Card key={a.id} className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="font-semibold text-slate-800">{a.title}</h4>
                <p className="text-sm text-slate-600 mt-1">{a.content}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs text-slate-400">{formatDate(a.date)}</span>
                  <span className="text-xs text-slate-400">by {a.author}</span>
                </div>
              </div>
              <BranchBadge branch={a.branch} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
