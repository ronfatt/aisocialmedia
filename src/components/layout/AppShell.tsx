"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { Menu, X, Sparkles, Building2 } from "lucide-react";
import { useWorkspace } from "@/context/WorkspaceContext";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { activeClient } = useWorkspace();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If on login page, render full-screen standalone page
  if (pathname === "/login") {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900 antialiased">
      {/* Desktop Fixed Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Drawer Backdrop & Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-50 flex w-72 flex-col bg-slate-900 shadow-2xl">
            <div className="flex h-16 items-center justify-between border-b border-slate-800 px-5">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-500" />
                <span className="font-bold text-white text-sm">Social Command</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <Sidebar onNavigate={() => setMobileMenuOpen(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col lg:pl-64 min-w-0">
        {/* Mobile Header Bar */}
        <div className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
          >
            <Menu className="h-5 w-5" />
          </button>

          {activeClient ? (
            <div className="flex items-center gap-2 truncate">
              <div className="h-6 w-6 rounded bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-700 overflow-hidden shrink-0">
                {activeClient.logoUrl ? (
                  <img src={activeClient.logoUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <Building2 className="h-3.5 w-3.5" />
                )}
              </div>
              <span className="truncate text-xs font-bold text-slate-900">{activeClient.name}</span>
            </div>
          ) : (
            <span className="text-xs font-bold text-slate-900">Clients</span>
          )}

          <div className="w-8" />
        </div>

        {/* Desktop Topbar */}
        <Topbar />

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 min-w-0 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
