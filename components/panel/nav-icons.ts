import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  CalendarClock,
  KeyRound,
  History,
  Bell,
  UserCircle,
  type LucideIcon,
} from "lucide-react";

export const NAV_ICONS: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  users: Users,
  admins: ShieldCheck,
  appointments: CalendarClock,
  myAppointments: CalendarClock,
  roles: KeyRound,
  auditLog: History,
  notifications: Bell,
  profile: UserCircle,
};
