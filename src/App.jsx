import { useState, useEffect } from "react";
import { SIDEBAR_NAV, ROLE_ICONS } from "./constants";
import { AppProvider } from "./context/AppContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Sidebar, Header } from "./components/layout";
import LoginPage from "./pages/LoginPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminStudentPage from "./pages/admin/AdminStudentPage";
import AdminStaffPage from "./pages/admin/AdminStaffPage";
import AdminBranchPage from "./pages/admin/AdminBranchPage";
import AdminHomeworkPage from "./pages/admin/AdminHomeworkPage";
import TeacherDashboardPage from "./pages/teacher/TeacherDashboardPage";
import TeacherAnnouncementPage from "./pages/teacher/TeacherAnnouncementPage";
import TeacherSchedulePage from "./pages/teacher/TeacherSchedulePage";
import StaffDashboardPage from "./pages/staff/StaffDashboardPage";
import StaffHomeworkPage from "./pages/staff/StaffHomeworkPage";
import StaffAttendancePage from "./pages/staff/StaffAttendancePage";
import StudentDashboardPage from "./pages/student/StudentDashboardPage";
import StudentProfilePage from "./pages/student/StudentProfilePage";
import StudentAttendancePage from "./pages/student/StudentAttendancePage";
import StudentAssignmentsPage from "./pages/student/StudentAssignmentsPage";
import StudentFeePage from "./pages/student/StudentFeePage";

const ACTIVE_NAV_KEY = "beeline_active_nav";

function AuthenticatedApp() {
  const { user, logout } = useAuth();
  const role = user.role;
  const navItems = SIDEBAR_NAV[role];

  // Restore the last-viewed tab for this role on refresh, falling back to
  // "dashboard" if nothing was stored or the stored value is no longer valid
  // (e.g. after a role switch or a nav item being renamed).
  const [activeNav, setActiveNav] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(ACTIVE_NAV_KEY) || "{}");
      const candidate = stored[role];
      return navItems?.some((item) => item.id === candidate) ? candidate : "dashboard";
    } catch {
      return "dashboard";
    }
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(ACTIVE_NAV_KEY) || "{}");
      stored[role] = activeNav;
      localStorage.setItem(ACTIVE_NAV_KEY, JSON.stringify(stored));
    } catch {
      // storage unavailable — persistence is best-effort, not required for the app to work
    }
  }, [role, activeNav]);

  const RoleIcon = ROLE_ICONS[role];

  const renderContent = () => {
    if (role === "Admin") {
      if (activeNav === "dashboard") return <AdminDashboardPage />;
      if (activeNav === "students") return <AdminStudentPage />;
      if (activeNav === "staff") return <AdminStaffPage />;
      if (activeNav === "branches") return <AdminBranchPage />;
      if (activeNav === "homework") return <AdminHomeworkPage />;
    }
    if (role === "Teacher") {
      if (activeNav === "dashboard") return <TeacherDashboardPage />;
      if (activeNav === "announcements") return <TeacherAnnouncementPage />;
      if (activeNav === "schedule") return <TeacherSchedulePage />;
    }
    if (role === "Staff") {
      if (activeNav === "dashboard") return <StaffDashboardPage />;
      if (activeNav === "homework") return <StaffHomeworkPage />;
      if (activeNav === "attendance") return <StaffAttendancePage />;
    }
    if (role === "Student") {
      if (activeNav === "dashboard") return <StudentDashboardPage />;
      if (activeNav === "profile") return <StudentProfilePage />; // Added this line
      if (activeNav === "my-attendance") return <StudentAttendancePage />;
      if (activeNav === "assignments") return <StudentAssignmentsPage />;
      if (activeNav === "fees") return <StudentFeePage />;
    }
    return null;
  };

  return (
    <AppProvider>
      <div className="min-h-screen bg-slate-100 flex">
        {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
        <Sidebar
          role={role}
          navItems={navItems}
          activeNav={activeNav}
          setActiveNav={setActiveNav}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          RoleIcon={RoleIcon}
          user={user}
          onLogout={logout}
        />
        <div className="flex-1 flex flex-col min-h-screen min-w-0">
          <Header
            role={role}
            navItems={navItems}
            activeNav={activeNav}
            setSidebarOpen={setSidebarOpen}
            RoleIcon={RoleIcon}
            user={user}
          />
          <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
            {renderContent()}
          </main>
          <footer className="border-t border-slate-200 bg-white px-4 lg:px-6 py-3 flex items-center justify-between">
            <p className="text-xs text-slate-400">&copy; 2026 Beeline Advanced Diploma in English</p>
            <p className="text-xs text-slate-400">Signed in as <span className="font-semibold text-indigo-600">{user.fullName}</span></p>
          </footer>
        </div>
      </div>
    </AppProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoot />
    </AuthProvider>
  );
}

function AppRoot() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <AuthenticatedApp /> : <LoginPage />;
}
