import {
  LayoutDashboard, GraduationCap, Users, Settings,
  Megaphone, Calendar, ClipboardCheck, CalendarCheck,
  BookOpen, CreditCard, User,
} from "lucide-react";

export const SIDEBAR_NAV = {
  Admin: [
    { id: "dashboard", label: "Dashboard Overview", icon: LayoutDashboard },
    { id: "students", label: "Student Management", icon: GraduationCap },
    { id: "staff", label: "Staff Management", icon: Users },
    { id: "branches", label: "Branch Settings", icon: Settings },
    { id: "homework", label: "Homework", icon: BookOpen },
  ],
  Teacher: [
    { id: "dashboard", label: "Teacher Dashboard", icon: LayoutDashboard },
    { id: "announcements", label: "Announcements", icon: Megaphone },
    { id: "schedule", label: "Class Schedule", icon: Calendar },
  ],
  Staff: [
    { id: "dashboard", label: "Staff Dashboard", icon: LayoutDashboard },
    { id: "homework", label: "Homework Verification", icon: ClipboardCheck },
    { id: "attendance", label: "Attendance Logs", icon: CalendarCheck },
  ],
  Student: [
    { id: "dashboard", label: "Student Dashboard", icon: LayoutDashboard },
    { id: "profile", label: "My Profile", icon: User },
    { id: "my-attendance", label: "My Attendance", icon: CalendarCheck },
    { id: "assignments", label: "Assignments", icon: BookOpen },
    { id: "fees", label: "Fee Status", icon: CreditCard },
  ],
};
