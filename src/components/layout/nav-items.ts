import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Wand2,
  CalendarCheck,
  Building2,
  Settings,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  adminOnly?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "لوحة التحكم", icon: LayoutDashboard },
  { href: "/parse", label: "تحليل الحجز", icon: Wand2 },
  { href: "/bookings", label: "الحجوزات", icon: CalendarCheck },
  { href: "/hotels", label: "دليل الفنادق", icon: Building2 },
  { href: "/settings", label: "الإعدادات", icon: Settings },
];
