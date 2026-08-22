import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  CalendarCheck,
  Building2,
  Settings,
  Users,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  adminOnly?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "لوحة التحكم", icon: LayoutDashboard },
  { href: "/bookings", label: "الحجوزات", icon: CalendarCheck },
  { href: "/hotels", label: "دليل الفنادق", icon: Building2 },
  { href: "/team", label: "الفريق", icon: Users, adminOnly: true },
  { href: "/settings", label: "الإعدادات", icon: Settings },
];
