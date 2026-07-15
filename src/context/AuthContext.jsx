import { createContext, useContext, useState, useCallback } from "react";
import { API_BASE_URL } from "../config/api";

const AuthContext = createContext(null);
const SESSION_KEY = "beeline_auth_user";

// Lazy-init from localStorage so the very first render already knows whether
// there's a session — avoids a flash of the login page on every refresh while
// state is still empty.
function loadStoredUser() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null; // corrupted/blocked storage — fall back to logged-out
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadStoredUser);

  const login = useCallback(async (username, password) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Login failed");
    }

    const roleMap = { ADMIN: "Admin", TEACHER: "Teacher", STAFF: "Staff", STUDENT: "Student" };
    const branches = data.branches || [];

    const nextUser = {
      id: data.id,
      fullName: data.fullName,
      username: data.username,
      role: roleMap[data.role] || data.role,
      status: data.status,
      canMarkAttendance: data.canMarkAttendance || false,
      branches,
      branchId: branches.length === 1 ? branches[0].id : null,
      branchName: branches.length === 1 ? branches[0].name : null,
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(nextUser));
    setUser(nextUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem("beeline_active_nav");
    setUser(null);
  }, []);

  const value = {
    user,
    isAuthenticated: !!user,
    role: user?.role || null,
    branchId: user?.branchId || null,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
