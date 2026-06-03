import {
  LayoutDashboard, Users, Megaphone, KanbanSquare, CalendarDays, UserCheck,
  Folder, FileSignature, GraduationCap, History, UserCog, LayoutGrid, Settings,
} from "lucide-react";
import type { Role } from "@/lib/auth/permissions";

export interface NavItem { href: string; label: string; icon: any; roles: Role[]; }
export interface NavGroup { label: string | null; items: NavItem[]; }

export const NAV: NavGroup[] = [
  { label: null, items: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["manager"] },
  ]},
  { label: "Recruitment", items: [
    { href: "/candidates", label: "Candidates", icon: Users, roles: ["manager"] },
    { href: "/postings", label: "Job Adverts", icon: Megaphone, roles: ["manager"] },
    { href: "/pipeline", label: "Pipeline", icon: KanbanSquare, roles: ["manager"] },
    { href: "/interviews", label: "Interviews", icon: CalendarDays, roles: ["manager"] },
    { href: "/review", label: "Director Reviews", icon: UserCheck, roles: ["manager", "director"] },
    { href: "/documents", label: "Documents", icon: Folder, roles: ["manager"] },
    { href: "/contracts", label: "Contracts", icon: FileSignature, roles: ["manager"] },
    { href: "/handover", label: "Handover", icon: GraduationCap, roles: ["manager", "academic"] },
    { href: "/activity", label: "Activity Log", icon: History, roles: ["manager"] },
  ]},
  { label: "Admin", items: [
    { href: "/users", label: "Users", icon: UserCog, roles: ["manager"] },
    { href: "/role-types", label: "Role Types", icon: LayoutGrid, roles: ["manager"] },
    { href: "/settings", label: "Settings", icon: Settings, roles: ["manager"] },
  ]},
];

export function navForRole(role: Role): NavGroup[] {
  return NAV.map((g) => ({ ...g, items: g.items.filter((i) => i.roles.includes(role)) }))
            .filter((g) => g.items.length > 0);
}
