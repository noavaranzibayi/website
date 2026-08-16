import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  CalendarClock,
  MessageSquareMore,
  KeyRound,
  History,
  Bell,
  UserCircle,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export const NAV_ICONS: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  users: Users,
  admins: ShieldCheck,
  appointments: CalendarClock,
  myAppointments: CalendarClock,
  consultations: MessageSquareMore,
  services: Sparkles,
  roles: KeyRound,
  auditLog: History,
  notifications: Bell,
  profile: UserCircle,
};
