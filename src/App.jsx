import { useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
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

function AuthenticatedApp() {
  const { user, logout } = useAuth();
  const role = user.role;
  const navItems = SIDEBAR_NAV[role];
  const base = `/${role.toLowerCase()}`;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const currentLabel = navItems.find((item) => location.pathname === `${base}/${item.id}`)?.label || "";

  const RoleIcon = ROLE_ICONS[role];

  const renderRoutes = () => {
    if (role === "Admin") {
      return (
        <>
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="students" element={<AdminStudentPage />} />
          <Route path="staff" element={<AdminStaffPage />} />
          <Route path="branches" element={<AdminBranchPage />} />
          <Route path="homework" element={<AdminHomeworkPage />} />
        </>
      );
    }
    if (role === "Teacher") {
      return (
        <>
          <Route path="dashboard" element={<TeacherDashboardPage />} />
          <Route path="announcements" element={<TeacherAnnouncementPage />} />
          <Route path="schedule" element={<TeacherSchedulePage />} />
        </>
      );
    }
    if (role === "Staff") {
      return (
        <>
          <Route path="dashboard" element={<StaffDashboardPage />} />
          <Route path="homework" element={<StaffHomeworkPage />} />
          <Route path="attendance" element={<StaffAttendancePage />} />
        </>
      );
    }
    if (role === "Student") {
      return (
        <>
          <Route path="dashboard" element={<StudentDashboardPage />} />
          <Route path="profile" element={<StudentProfilePage />} />
          <Route path="my-attendance" element={<StudentAttendancePage />} />
          <Route path="assignments" element={<StudentAssignmentsPage />} />
          <Route path="fees" element={<StudentFeePage />} />
        </>
      );
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
          base={base}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          RoleIcon={RoleIcon}
          user={user}
          onLogout={logout}
        />
        <div className="flex-1 flex flex-col min-h-screen min-w-0">
          <Header
            role={role}
            currentLabel={currentLabel}
            setSidebarOpen={setSidebarOpen}
            RoleIcon={RoleIcon}
            user={user}
          />
          <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
            <Routes>
              {renderRoutes()}
              <Route path="*" element={<Navigate to={`${base}/dashboard`} replace />} />
            </Routes>
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
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  const base = `/${user.role.toLowerCase()}`;
  return (
    <Routes>
      <Route path="/login" element={<Navigate to={`${base}/dashboard`} replace />} />
      <Route path={`${base}/*`} element={<AuthenticatedApp />} />
      <Route path="*" element={<Navigate to={`${base}/dashboard`} replace />} />
    </Routes>
  );
}
