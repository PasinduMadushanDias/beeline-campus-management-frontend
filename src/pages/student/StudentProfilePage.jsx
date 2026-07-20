import { useState, useEffect } from "react";
import { UserCircle2, IdCard, MapPin, Phone, Mail, Cake, VenetianMask, Building2, CalendarDays, QrCode, AlertCircle, Loader2, KeyRound, ChevronDown, ChevronUp } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { PageHeader, Card, StatusBadge, BranchBadge, SuccessToast } from "../../components/shared";
import QRStickerModal from "../../components/shared/QRStickerModal";
import { API_BASE_URL } from "../../config/api";

const MIN_PASSWORD_LENGTH = 4;

const API = `${API_BASE_URL}/student`;

const GENDER_LABELS = { MALE: "Male", FEMALE: "Female", OTHER: "Other" };

function formatDate(isoDate) {
  if (!isoDate) return "—";
  return new Date(isoDate).toLocaleDateString("en-LK", { year: "numeric", month: "long", day: "numeric" });
}

/** A single labeled field in the profile grid — icon, label, value. Read-only by design. */
function ProfileField({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50/80">
      <div className="p-2 bg-white rounded-lg border border-slate-100">
        <Icon size={16} className="text-indigo-500" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</p>
        <p className="text-sm font-medium text-slate-800 truncate">{value || "—"}</p>
      </div>
    </div>
  );
}

/** Collapsible card letting a student change their own password. */
function ChangePasswordCard({ userId }) {
  const [expanded, setExpanded] = useState(false);
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (form.newPassword !== form.confirmPassword) {
      setFormError("New password and confirmation do not match.");
      return;
    }
    if (form.newPassword.length < MIN_PASSWORD_LENGTH) {
      setFormError(`New password must be at least ${MIN_PASSWORD_LENGTH} characters long.`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API}/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || "Failed to change password");
      }
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      showToast("Password changed successfully!");
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="p-6">
      {toast && <SuccessToast message={toast} />}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between cursor-pointer"
      >
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          <KeyRound size={18} className="text-indigo-600" /> Change Password
        </h3>
        {expanded ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
      </button>

      {expanded && (
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5">Current Password</label>
            <input
              type="password"
              value={form.currentPassword}
              onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
              required
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5">New Password</label>
            <input
              type="password"
              value={form.newPassword}
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
              required
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5">Confirm New Password</label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              required
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>

          {formError && (
            <p className="text-xs text-red-600 flex items-center gap-1.5"><AlertCircle size={13} /> {formError}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-2 cursor-pointer"
          >
            {submitting ? <Loader2 size={15} className="animate-spin" /> : <KeyRound size={15} />}
            Update Password
          </button>
        </form>
      )}
    </Card>
  );
}

export default function StudentProfilePage() {
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showQr, setShowQr] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    let cancelled = false;
    setLoading(true);
    setError("");

    fetch(`${API}/profile?userId=${user.id}`)
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || "Failed to load profile");
        }
        return res.json();
      })
      .then((data) => { if (!cancelled) setProfile(data); })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [user?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-400 gap-2">
        <Loader2 size={18} className="animate-spin" />
        <span className="text-sm">Loading your profile...</span>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <Card className="p-8 flex flex-col items-center text-center gap-2">
        <AlertCircle size={24} className="text-red-500" />
        <p className="text-sm font-medium text-slate-700">Couldn't load your profile</p>
        <p className="text-xs text-slate-400">{error || "Please try again later."}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={UserCircle2}
        title="My Profile"
        subtitle="Your enrolment details at Beeline Campus"
      />

      <Card className="p-6">
        {/* Identity header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-6 mb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
            <span className="text-xl font-bold text-indigo-600">
              {profile.fullName?.charAt(0)?.toUpperCase() || "S"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-slate-800 truncate">{profile.fullName}</h2>
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              <span className="text-xs font-mono text-indigo-600 font-semibold bg-indigo-50 px-2 py-1 rounded-md">
                {profile.studentIdNo}
              </span>
              <BranchBadge branch={profile.branchName} />
              <StatusBadge status={profile.status === "ACTIVE" ? "Active" : profile.status === "INACTIVE" ? "Inactive" : profile.status} />
            </div>
          </div>
          <button
            onClick={() => setShowQr(true)}
            className="px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 cursor-pointer flex-shrink-0"
          >
            <QrCode size={15} /> View My QR ID
          </button>
        </div>

        {/* Read-only field grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ProfileField icon={IdCard} label="Student ID" value={profile.studentIdNo} />
          <ProfileField icon={Building2} label="Branch" value={profile.branchName} />
          <ProfileField icon={Mail} label="Email" value={profile.email} />
          <ProfileField icon={Phone} label="Telephone" value={profile.telephone} />
          <ProfileField icon={MapPin} label="Address" value={profile.address} />
          <ProfileField icon={Cake} label="Birthday" value={formatDate(profile.birthday)} />
          <ProfileField icon={VenetianMask} label="Gender" value={GENDER_LABELS[profile.gender] || profile.gender} />
          <ProfileField icon={IdCard} label="NIC" value={profile.nic} />
          <ProfileField icon={CalendarDays} label="Enrolled On" value={formatDate(profile.enrollmentDate)} />
        </div>

        <p className="text-xs text-slate-400 mt-6 text-center">
          Spotted an error in your details? Please contact the campus office to have it corrected.
        </p>
      </Card>

      <ChangePasswordCard userId={user.id} />

      <QRStickerModal student={showQr ? profile : null} onClose={() => setShowQr(false)} />
    </div>
  );
}