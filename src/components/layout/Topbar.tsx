"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useWorkspace } from "@/context/WorkspaceContext";
import { MOCK_USERS } from "@/lib/mockUsers";
import {
  Building2,
  ChevronDown,
  Plus,
  Search,
  Bell,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  UserCheck,
  X,
} from "lucide-react";

export function Topbar() {
  const {
    activeClient,
    clients,
    switchClient,
    isDirty,
    pendingClientId,
    confirmDiscardAndSwitch,
    cancelSwitch,
    activeUser,
    setActiveUser,
  } = useWorkspace();

  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const [isUserSwitcherOpen, setIsUserSwitcherOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.industry.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-6 shadow-xs">
        {/* Left: Active Client Identity or Agency Home */}
        <div className="flex items-center gap-4">
          {activeClient ? (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 overflow-hidden font-semibold text-slate-700 shadow-xs">
                {activeClient.logoUrl ? (
                  <img
                    src={activeClient.logoUrl}
                    alt={activeClient.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Building2 className="h-5 w-5 text-slate-500" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold tracking-tight text-slate-900 text-base">
                    {activeClient.name}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      activeClient.status === "ACTIVE"
                        ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20 ring-inset"
                        : activeClient.status === "ONBOARDING"
                        ? "bg-blue-50 text-blue-700 ring-1 ring-blue-600/20 ring-inset"
                        : activeClient.status === "PAUSED"
                        ? "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20 ring-inset"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {activeClient.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {activeClient.industry} • {activeClient.locationCity}, {activeClient.locationState}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900 text-lg">Clients Overview</span>
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                {clients.length} Total
              </span>
            </div>
          )}

          {/* Quick Client Switcher Dropdown */}
          <div className="relative ml-4">
            <button
              onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <span>Switch Client</span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
            </button>

            {isSwitcherOpen && (
              <div className="absolute left-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-2 shadow-xl z-50">
                <div className="relative mb-2">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search clients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 pl-8 pr-3 py-1.5 text-xs focus:border-blue-500 focus:outline-hidden"
                    autoFocus
                  />
                </div>

                <div className="max-h-60 overflow-y-auto space-y-1">
                  {filteredClients.map((client) => {
                    const isSelected = activeClient?.id === client.id;
                    return (
                      <button
                        key={client.id}
                        onClick={() => {
                          setIsSwitcherOpen(false);
                          switchClient(client.id);
                        }}
                        className={`w-full flex items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs transition-colors ${
                          isSelected
                            ? "bg-blue-50 text-blue-900 font-semibold"
                            : "hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <div className="h-6 w-6 rounded bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600 shrink-0 overflow-hidden">
                            {client.logoUrl ? (
                              <img src={client.logoUrl} alt="" className="h-full w-full object-cover" />
                            ) : (
                              client.name.slice(0, 2).toUpperCase()
                            )}
                          </div>
                          <div className="truncate">
                            <p className="truncate font-medium">{client.name}</p>
                            <p className="text-[10px] text-slate-400 truncate">{client.industry}</p>
                          </div>
                        </div>
                        {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 shrink-0" />}
                      </button>
                    );
                  })}
                  {filteredClients.length === 0 && (
                    <div className="py-4 text-center text-xs text-slate-400">No clients found</div>
                  )}
                </div>

                <div className="mt-2 border-t border-slate-100 pt-2">
                  <Link
                    href="/clients/new"
                    onClick={() => setIsSwitcherOpen(false)}
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-slate-50 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>+ Add New Client</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Notifications & Multi-Tenant User Switcher */}
        <div className="flex items-center gap-3">
          {/* Notifications Placeholder */}
          <button
            title="Notifications"
            className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-600"></span>
          </button>

          {/* User Role Testing Switcher */}
          <div className="relative">
            <button
              onClick={() => setIsUserSwitcherOpen(!isUserSwitcherOpen)}
              className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-1.5 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <img
                src={activeUser.avatarUrl || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop"}
                alt={activeUser.name}
                className="h-6 w-6 rounded-full object-cover"
              />
              <div className="text-left text-xs">
                <p className="font-semibold text-slate-800 leading-none">{activeUser.name}</p>
                <p className="text-[10px] text-slate-500 font-medium">{activeUser.role}</p>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>

            {isUserSwitcherOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-2 shadow-xl z-50">
                <div className="px-3 py-1.5 border-b border-slate-100 mb-1">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Switch Test User & Role
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Test client-level data isolation in real time.
                  </p>
                </div>

                <div className="space-y-1">
                  {MOCK_USERS.map((user) => {
                    const isSelected = activeUser.email === user.email;
                    return (
                      <button
                        key={user.email}
                        onClick={() => {
                          setActiveUser(user);
                          setIsUserSwitcherOpen(false);
                        }}
                        className={`w-full flex items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs transition-colors ${
                          isSelected
                            ? "bg-blue-50 text-blue-900 font-medium"
                            : "hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <img
                            src={user.avatarUrl!}
                            alt={user.name}
                            className="h-7 w-7 rounded-full object-cover"
                          />
                          <div>
                            <p className="font-semibold">{user.name}</p>
                            <p className="text-[10px] text-slate-500">{user.role}</p>
                          </div>
                        </div>
                        {isSelected && <UserCheck className="h-4 w-4 text-blue-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Unsaved Changes Confirmation Modal */}
      {pendingClientId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900">Unsaved Changes Warning</h3>
                <p className="mt-1 text-sm text-slate-500">
                  You have unsaved changes in the current client workspace. Switching clients now will discard
                  all unsaved form data.
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={cancelSwitch}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Stay on Current Client
              </button>
              <button
                type="button"
                onClick={confirmDiscardAndSwitch}
                className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-red-700 transition-colors"
              >
                Discard & Switch Client
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
