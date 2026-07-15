export default function EmptyState({ icon: Icon, message }) {
  return (
    <div className="p-12 text-center">
      <Icon size={36} className="text-slate-300 mx-auto mb-3" />
      <p className="text-sm text-slate-400">{message}</p>
    </div>
  );
}
