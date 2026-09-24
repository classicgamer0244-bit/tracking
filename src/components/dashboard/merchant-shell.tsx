"use client";

import {
  LayoutDashboard,
  Package,
  PackagePlus,
  MessageSquare,
  Bell,
  Users,
  Settings,
} from "lucide-react";
import { DashboardShell, type NavItem } from "@/components/dashboard/shell";

export function MerchantShell({
  userName,
  userSubtitle,
  canCreateShipment,
  canManageStaff,
  children,
}: {
  userName: string;
  userSubtitle: string;
  canCreateShipment: boolean;
  canManageStaff: boolean;
  children: React.ReactNode;
}) {
  const navItems: NavItem[] = [
    { href: "/merchant/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/merchant/shipments", label: "Shipments", icon: Package },
  ];

  if (canCreateShipment) {
    navItems.push({ href: "/merchant/shipments/new", label: "Create Shipment", icon: PackagePlus });
  }

  navItems.push({ href: "/merchant/messages", label: "Messages", icon: MessageSquare });
  navItems.push({ href: "/merchant/notifications", label: "Notifications", icon: Bell });

  if (canManageStaff) {
    navItems.push({ href: "/merchant/staff", label: "Staff", icon: Users });
  }

  navItems.push({ href: "/merchant/settings", label: "Settings", icon: Settings });

  return (
    <DashboardShell brand="ShipTrack" navItems={navItems} userName={userName} userSubtitle={userSubtitle}>
      {children}
    </DashboardShell>
  );
}
