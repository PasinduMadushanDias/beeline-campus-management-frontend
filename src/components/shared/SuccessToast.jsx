import { CheckCircle2 } from "lucide-react";

export default function SuccessToast({ message }) {
  return (
    <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-sm flex items-center gap-2">
      <CheckCircle2 size={16} /> {message}
    </div>
  );
}
