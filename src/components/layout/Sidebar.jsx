import { X, LogOut } from "lucide-react";

export default function Sidebar({ role, navItems, activeNav, setActiveNav, sidebarOpen, setSidebarOpen, RoleIcon, user, onLogout }) {
  return (
    <aside className={`fixed lg:sticky top-0 left-0 z-50 lg:z-auto h-screen w-64 bg-slate-900 text-white flex flex-col transition-transform duration-200 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
      <div className="p-5 border-b border-slate-700/50 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-sm">BC</div>
          <div>
            <h2 className="text-sm font-bold tracking-tight">Beeline Campus</h2>
            <p className="text-xs text-slate-400">Management Portal</p>
          </div>
        </div>
        <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white cursor-pointer"><X size={18} /></button>
      </div>

      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/60 rounded-lg">
          <RoleIcon size={14} className="text-indigo-400" />
          <span className="text-xs font-medium text-slate-300">{role} Panel</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const active = activeNav === item.id;
          return (
            <button key={item.id} onClick={() => { setActiveNav(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors cursor-pointer ${active ? "bg-indigo-600 text-white font-medium" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}>
              <item.icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="px-3 pb-2">
        <div className="px-3 py-2.5 bg-slate-800/40 rounded-lg mb-2">
          <p className="text-sm font-medium text-slate-200 truncate">{user?.fullName}</p>
          <p className="text-xs text-slate-500 truncate">@{user?.username}{user?.branchName ? ` · ${user.branchName}` : ""}</p>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors cursor-pointer"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>

      <div className="p-4 border-t border-slate-700/50">
        <p className="text-xs text-slate-500 text-center">Beeline ADE &copy; 2026</p>
      </div>
    </aside>
  );
}
