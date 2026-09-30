"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWorkspace } from "@/context/WorkspaceContext";
import {
  LayoutDashboard,
  Building2,
  Compass,
  FileText,
  CalendarDays,
  Image,
  Share2,
  Inbox,
  UserSquare2,
  BarChart3,
  Megaphone,
  UserCheck2,
  Settings,
  ArrowLeft,
  Sparkles,
} from "lucide-react";

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { activeClient } = useWorkspace();

  const isClientWorkspace = activeClient && pathname.startsWith(`/clients/${activeClient.id}`);

  const clientNavItems = activeClient
    ? [
        { label: "Overview", href: `/clients/${activeClient.id}/overview`, icon: LayoutDashboard },
        { label: "Strategy", href: `/clients/${activeClient.id}/strategy`, icon: Compass, badge: "AI Brain" },
        { label: "Content", href: `/clients/${activeClient.id}/content`, icon: FileText },
        { label: "Calendar", href: `/clients/${activeClient.id}/calendar`, icon: CalendarDays },
        { label: "Media Library", href: `/clients/${activeClient.id}/media`, icon: Image },
        { label: "Social Accounts", href: `/clients/${activeClient.id}/social-accounts`, icon: Share2 },
        { label: "Inbox", href: `/clients/${activeClient.id}/inbox`, icon: Inbox, isPlaceholder: true },
        { label: "Leads", href: `/clients/${activeClient.id}/leads`, icon: UserSquare2, isPlaceholder: true },
        { label: "Analytics", href: `/clients/${activeClient.id}/analytics`, icon: BarChart3, isPlaceholder: true },
        { label: "Campaigns", href: `/clients/${activeClient.id}/campaigns`, icon: Megaphone, isPlaceholder: true },
        { label: "Client Profile", href: `/clients/${activeClient.id}/profile`, icon: UserCheck2 },
        { label: "Settings", href: `/clients/${activeClient.id}/settings`, icon: Settings, isPlaceholder: true },
      ]
    : [];

  const handleLinkClick = () => {
    if (onNavigate) onNavigate();
  };

  return (
    <aside className="flex h-full w-64 flex-col border-r border-slate-800 bg-slate-900 text-white shadow-lg lg:fixed lg:inset-y-0 lg:left-0 z-40">
      {/* Brand Header */}
      <div className="flex h-16 items-center gap-2.5 border-b border-slate-800 px-5 shrink-0">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 font-bold shadow-md">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-tight text-white">Social Command</h1>
          <p className="text-[10px] text-slate-400 font-medium">Agency Operating System</p>
        </div>
      </div>

      {/* Main Navigation Area */}
      <div className="flex flex-1 flex-col overflow-y-auto px-3 py-4">
        {isClientWorkspace ? (
          <>
            {/* Back to all clients */}
            <Link
              href="/clients"
              onClick={handleLinkClick}
              className="mb-4 flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>← All Clients</span>
            </Link>

            {/* Current Client Header Card in Sidebar */}
            <div className="mb-4 rounded-xl border border-slate-800 bg-slate-800/60 p-3 shadow-inner">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-700 text-xs font-bold text-white shrink-0 overflow-hidden">
                  {activeClient.logoUrl ? (
                    <img src={activeClient.logoUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <Building2 className="h-4 w-4 text-slate-300" />
                  )}
                </div>
                <div className="truncate">
                  <p className="truncate text-xs font-bold text-white">{activeClient.name}</p>
                  <p className="truncate text-[10px] text-slate-400">{activeClient.industry}</p>
                </div>
              </div>
            </div>

            {/* Client Workspace Links */}
            <div className="space-y-1">
              <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Workspace
              </p>
              {clientNavItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={handleLinkClick}
                    className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                      isActive
                        ? "bg-blue-600 text-white font-semibold shadow-xs"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="rounded-full bg-indigo-500/20 px-1.5 py-0.5 text-[9px] font-semibold text-indigo-300">
                        {item.badge}
                      </span>
                    )}
                    {item.isPlaceholder && (
                      <span className="text-[9px] font-medium text-slate-500">v2</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </>
        ) : (
          <div className="space-y-1">
            <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Agency Management
            </p>
            <Link
              href="/clients"
              onClick={handleLinkClick}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                pathname.startsWith("/clients")
                  ? "bg-blue-600 text-white font-semibold shadow-xs"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Building2 className="h-4 w-4" />
              <span>Clients</span>
            </Link>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="border-t border-slate-800 p-3 shrink-0">
        <div className="rounded-lg bg-slate-800/40 p-2 text-center text-[10px] text-slate-400">
          <p className="font-semibold text-slate-300">Phase 2 Multi-Tenant OS</p>
          <p className="mt-0.5 text-slate-500">Client Isolation Active</p>
        </div>
      </div>
    </aside>
  );
}
