"use client";

import React from "react";
import Link from "next/link";
import { Search, Plus, Filter } from "lucide-react";
import { ClientStatus } from "@/types";

interface ClientFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  counts: {
    all: number;
    ACTIVE: number;
    ONBOARDING: number;
    PAUSED: number;
    ARCHIVED: number;
  };
}

export function ClientFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  counts,
}: ClientFiltersProps) {
  const tabs = [
    { label: "All Clients", value: "ALL", count: counts.all },
    { label: "Active", value: "ACTIVE", count: counts.ACTIVE },
    { label: "Onboarding", value: "ONBOARDING", count: counts.ONBOARDING },
    { label: "Paused", value: "PAUSED", count: counts.PAUSED },
    { label: "Archived", value: "ARCHIVED", count: counts.ARCHIVED },
  ];

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Search Input & Filter Tabs */}
      <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search clients by name, industry, or city..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-hidden shadow-xs"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100/60 p-1">
          {tabs.map((tab) => {
            const isActive = statusFilter === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => onStatusFilterChange(tab.value)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? "bg-white text-blue-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                    isActive ? "bg-blue-100 text-blue-800" : "bg-slate-200/80 text-slate-600"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Primary Action: Add New Client */}
      <Link
        href="/clients/new"
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
      >
        <Plus className="h-4 w-4" />
        <span>Add New Client</span>
      </Link>
    </div>
  );
}
