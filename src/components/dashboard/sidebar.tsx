"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Globe,
  Inbox,
  QrCode,
  Sparkles,
  BarChart3,
  Stars,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { ROUTES } from "@/config/routes";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  group?: "main" | "loyalty" | "config";
  badge?: string;
}

const NAV: NavItem[] = [
  { label: "Vue d'ensemble", href: ROUTES.dashboard, icon: LayoutDashboard, group: "main" },
  { label: "Mon mini-site", href: ROUTES.dashboardSite, icon: Globe, group: "main" },
  { label: "Demandes", href: ROUTES.dashboardLeads, icon: Inbox, group: "main" },
  { label: "QR codes", href: ROUTES.dashboardQr, icon: QrCode, group: "main" },
  { label: "Offres", href: ROUTES.dashboardOffers, icon: Sparkles, group: "main" },
  { label: "Analytics", href: ROUTES.dashboardAnalytics, icon: BarChart3, group: "main" },

  { label: "Programme fidélité", href: ROUTES.dashboardLoyalty, icon: Stars, group: "loyalty" },
  { label: "Clients fidèles", href: ROUTES.dashboardCustomers, icon: Users, group: "loyalty" },

  { label: "Paramètres", href: ROUTES.dashboardSettings, icon: Settings, group: "config" },
];

export function DashboardSidebar({ businessName, businessSlug }: { businessName: string; businessSlug: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    await fetch(ROUTES.apiAuthLogout, { method: "POST" });
    window.location.href = "/";
  }

  return (
    <>
      {/* Mobile trigger */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 rounded-lg bg-white border border-cream-400 shadow-soft"
        aria-label="Ouvrir le menu"
      >
        <Menu className="h-5 w-5 text-ink-900" />
      </button>

      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-ink-900/40 backdrop-blur-sm z-40"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 h-screen w-72 bg-white border-r border-cream-300 z-50 lg:z-auto transition-transform",
          "flex flex-col",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="px-5 py-5 border-b border-cream-200 flex items-center justify-between">
          <Link href={ROUTES.dashboard} className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-moss-300 flex items-center justify-center text-moss-900 font-display font-medium shadow-glow">
              L
            </div>
            <div>
              <div className="font-display text-base text-ink-900 leading-tight tracking-tight truncate max-w-[140px]">
                {businessName}
              </div>
              <div className="text-[11px] text-ink-400 truncate max-w-[140px]">
                /{businessSlug}
              </div>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="lg:hidden p-1 rounded-md hover:bg-cream-100"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-0.5">
            {NAV.filter((n) => n.group === "main").map((item) => (
              <SidebarLink key={item.href} item={item} active={pathname === item.href} onClick={() => setOpen(false)} />
            ))}
          </ul>

          <div className="mt-6 mb-2 px-3 text-[11px] font-medium uppercase tracking-wider text-ink-300">
            Fidélité
          </div>
          <ul className="space-y-0.5">
            {NAV.filter((n) => n.group === "loyalty").map((item) => (
              <SidebarLink key={item.href} item={item} active={pathname === item.href} onClick={() => setOpen(false)} />
            ))}
          </ul>

          <div className="mt-6 mb-2 px-3 text-[11px] font-medium uppercase tracking-wider text-ink-300">
            Compte
          </div>
          <ul className="space-y-0.5">
            {NAV.filter((n) => n.group === "config").map((item) => (
              <SidebarLink key={item.href} item={item} active={pathname === item.href} onClick={() => setOpen(false)} />
            ))}
          </ul>
        </nav>

        {/* Footer / logout */}
        <div className="px-3 py-3 border-t border-cream-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-ink-400 hover:bg-cream-100 hover:text-ink-900 transition-colors"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.6} />
            Se déconnecter
          </button>
        </div>
      </aside>
    </>
  );
}

function SidebarLink({
  item,
  active,
  onClick,
}: {
  item: NavItem;
  active: boolean;
  onClick: () => void;
}) {
  const Icon = item.icon;
  return (
    <li>
      <Link
        href={item.href}
        onClick={onClick}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
          active
            ? "bg-moss-50 text-ink-900 font-medium"
            : "text-ink-500 hover:bg-cream-100 hover:text-ink-900"
        )}
      >
        <Icon className={cn("h-4 w-4", active && "text-moss-700")} strokeWidth={1.6} />
        <span className="flex-1">{item.label}</span>
        {item.badge && (
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-moss-100 text-moss-800">
            {item.badge}
          </span>
        )}
      </Link>
    </li>
  );
}
