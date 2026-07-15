export default function InputField({ label, value, onChange, placeholder, type = "text", disabled = false }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-600 mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition ${disabled ? "bg-slate-50 text-slate-500 cursor-not-allowed" : ""}`}
        placeholder={placeholder}
        disabled={disabled}
      />
    </div>
  );
}
