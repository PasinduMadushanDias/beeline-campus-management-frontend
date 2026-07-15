export default function PageHeader({ icon: Icon, title, subtitle, badge, children }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100">
          <Icon size={20} className="text-indigo-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800">{title}</h2>
          {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
        </div>
        {badge && <span className="text-xs bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full font-medium">{badge}</span>}
      </div>
      {children}
    </div>
  );
}
