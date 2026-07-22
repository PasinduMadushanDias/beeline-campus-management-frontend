import { Menu } from "lucide-react";

export default function Header({ role, currentLabel, setSidebarOpen, RoleIcon, user }) {
  return (
    <header className="bg-white border-b border-slate-200 px-4 lg:px-6 py-3 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg cursor-pointer">
          <Menu size={20} />
        </button>
        <h1 className="text-sm font-semibold text-slate-700 hidden sm:block">{currentLabel}</h1>
      </div>

      <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg">
        <RoleIcon size={16} className="text-indigo-600" />
        <span className="text-sm font-medium text-slate-700">{user?.fullName}</span>
        <span className="text-xs text-slate-400 hidden sm:inline">({role})</span>
      </div>
    </header>
  );
}
