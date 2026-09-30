"use client";

import React, { useState, useMemo } from "react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { ClientCard } from "@/components/clients/ClientCard";
import { ClientFilters } from "@/components/clients/ClientFilters";
import { Building2, Sparkles, ShieldCheck } from "lucide-react";

export default function ClientsPage() {
  const { clients, isLoading, activeUser } = useWorkspace();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const counts = useMemo(() => {
    return {
      all: clients.length,
      ACTIVE: clients.filter((c) => c.status === "ACTIVE").length,
      ONBOARDING: clients.filter((c) => c.status === "ONBOARDING").length,
      PAUSED: clients.filter((c) => c.status === "PAUSED").length,
      ARCHIVED: clients.filter((c) => c.status === "ARCHIVED").length,
    };
  }, [clients]);

  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const matchesSearch =
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.locationCity.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.locationState.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" ? true : client.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [clients, searchTerm, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Clients</h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 ring-1 ring-blue-600/20 ring-inset">
              <ShieldCheck className="h-3.5 w-3.5" />
              Isolated Multi-Tenant
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Select a client to enter their isolated social media command center, strategy, and content pipelines.
          </p>
        </div>

        {/* Role Identity indicator */}
        <div className="flex items-center gap-2 text-xs text-slate-500 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-xs">
          <span>Active Scope:</span>
          <span className="font-semibold text-slate-800">{activeUser.name}</span>
          <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
            {activeUser.role}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <ClientFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        counts={counts}
      />

      {/* Clients Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-72 rounded-2xl border border-slate-200 bg-white p-5 animate-pulse shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-slate-200" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-3/4 rounded bg-slate-200" />
                  <div className="h-3 w-1/2 rounded bg-slate-200" />
                </div>
              </div>
              <div className="mt-8 space-y-3">
                <div className="h-12 rounded-lg bg-slate-100" />
                <div className="h-16 rounded-xl bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredClients.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredClients.map((client) => (
            <ClientCard key={client.id} client={client} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white py-16 px-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-50 text-slate-400">
            <Building2 className="h-7 w-7" />
          </div>
          <h3 className="mt-4 text-base font-bold text-slate-900">No clients match your filter</h3>
          <p className="mt-1 text-sm text-slate-500 max-w-sm">
            {searchTerm
              ? `No clients found for "${searchTerm}". Try adjusting your keywords or clearing your status filter.`
              : "No clients found in this category for your current user role."}
          </p>
          <button
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("ALL");
            }}
            className="mt-4 text-xs font-semibold text-blue-600 hover:text-blue-800"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
