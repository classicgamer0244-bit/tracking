"use client";

import {
  LayoutDashboard,
  Building2,
  Package,
  MessageSquare,
  Bell,
  ScrollText,
  Settings,
} from "lucide-react";
import { DashboardShell, type NavItem } from "@/components/dashboard/shell";

const navItems: NavItem[] = [
  { href: "/super-admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/super-admin/merchants", label: "Merchants", icon: Building2 },
  { href: "/super-admin/shipments", label: "Shipments", icon: Package },
  { href: "/super-admin/messages", label: "Messages", icon: MessageSquare },
  { href: "/super-admin/notifications", label: "Notifications", icon: Bell },
  { href: "/super-admin/audit-logs", label: "Audit Logs", icon: ScrollText },
  { href: "/super-admin/settings", label: "Settings", icon: Settings },
];

export function SuperAdminShell({
  userName,
  children,
}: {
  userName: string;
  children: React.ReactNode;
}) {
  return (
    <DashboardShell
      brand="ShipTrack Admin"
      navItems={navItems}
      userName={userName}
      userSubtitle="Super Admin"
      searchBasePath="/super-admin/shipments"
    >
      {children}
    </DashboardShell>
  );
}
