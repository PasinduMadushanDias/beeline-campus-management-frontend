import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { INITIAL_ANNOUNCEMENTS } from "../constants";

const API = "http://localhost:8080/api/v1";
const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [students, setStudents] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  const [announcements, setAnnouncements] = useState(INITIAL_ANNOUNCEMENTS);
  const [branches, setBranches] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [homeworkTasks, setHomeworkTasks] = useState([]);

  const fetchBranches = useCallback(async () => {
    try {
      const res = await fetch(`${API}/admin/branches`);
      if (res.ok) setBranches(await res.json());
    } catch { /* keep current state */ }
  }, []);

  const fetchStudents = useCallback(async () => {
    try {
      const res = await fetch(`${API}/admin/students`);
      if (res.ok) setStudents(await res.json());
    } catch { /* keep current state */ }
  }, []);

  const fetchStaff = useCallback(async () => {
    try {
      const res = await fetch(`${API}/admin/staff`);
      if (res.ok) setStaffMembers(await res.json());
    } catch { /* keep current state */ }
  }, []);

  const fetchAttendance = useCallback(async (params = {}) => {
    try {
      const query = new URLSearchParams();
      if (params.branchId) query.set("branchId", params.branchId);
      if (params.date) query.set("date", params.date);
      const qs = query.toString();
      const res = await fetch(`${API}/attendance${qs ? `?${qs}` : ""}`);
      if (res.ok) setAttendance(await res.json());
    } catch { /* keep current state */ }
  }, []);

  const fetchMyAttendance = useCallback(async (userId) => {
    try {
      const res = await fetch(`${API}/attendance/my?userId=${userId}`);
      if (res.ok) setAttendance(await res.json());
    } catch { /* keep current state */ }
  }, []);

  const fetchHomeworkTasks = useCallback(async (params = {}) => {
    try {
      const query = new URLSearchParams();
      if (params.branchId) query.set("branchId", params.branchId);
      const qs = query.toString();
      const res = await fetch(`${API}/homework/tasks${qs ? `?${qs}` : ""}`);
      if (res.ok) setHomeworkTasks(await res.json());
    } catch { /* keep current state */ }
  }, []);

  const fetchHomeworkByBranchDate = useCallback(async (branchId, date) => {
    try {
      const res = await fetch(`${API}/homework/branch/${branchId}/date/${date}`);
      if (res.ok) return await res.json();
      return { tasks: [], submissions: [] };
    } catch {
      return { tasks: [], submissions: [] };
    }
  }, []);

  const fetchMyHomework = useCallback(async (userId) => {
    try {
      const res = await fetch(`${API}/homework/my?userId=${userId}`);
      if (res.ok) return await res.json();
      return [];
    } catch {
      return [];
    }
  }, []);

  const fetchStudentView = useCallback(async (branchId, date, userId) => {
    try {
      const res = await fetch(`${API}/homework/student-view/branch/${branchId}/date/${date}?userId=${userId}`);
      if (res.ok) return await res.json();
      return [];
    } catch {
      return [];
    }
  }, []);

  useEffect(() => {
    fetchBranches();
    fetchStudents();
    fetchStaff();
  }, [fetchBranches, fetchStudents, fetchStaff]);

  const value = {
    students, setStudents, fetchStudents,
    staffMembers, setStaffMembers, fetchStaff,
    announcements, setAnnouncements,
    branches, setBranches, fetchBranches,
    attendance, setAttendance, fetchAttendance, fetchMyAttendance,
    homeworkTasks, setHomeworkTasks, fetchHomeworkTasks,
    fetchHomeworkByBranchDate, fetchMyHomework, fetchStudentView,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within an AppProvider");
  return context;
}
