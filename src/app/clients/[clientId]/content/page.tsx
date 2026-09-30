"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  FileText,
  Plus,
  Clock,
  CheckCircle2,
  Calendar,
  Share2,
  Filter,
} from "lucide-react";

export default function ContentShellPage() {
  const params = useParams();
  const clientId = params.clientId as string;

  const [activeTab, setActiveTab] = useState("ALL");
  const [contentItems, setContentItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadContent() {
      try {
        const res = await fetch(`/api/clients/${clientId}`);
        if (res.ok) {
          const json = await res.json();
          setContentItems(json.client?.contentItems || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadContent();
  }, [clientId]);

  const filteredItems = contentItems.filter((item) => {
    if (activeTab === "ALL") return true;
    return item.status === activeTab;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return "bg-emerald-50 text-emerald-700 ring-emerald-600/20";
      case "SCHEDULED":
        return "bg-indigo-50 text-indigo-700 ring-indigo-600/20";
      case "PENDING_APPROVAL":
        return "bg-amber-50 text-amber-700 ring-amber-600/20";
      default:
        return "bg-slate-100 text-slate-700 ring-slate-500/20";
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Content Pipeline</h1>
          <p className="mt-1 text-xs text-slate-500">
            Isolated content drafts, review queue, and scheduled posts for this client.
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert("Content Editor Modal is scheduled for Phase 2")}
          className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          <span>+ Create Post</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xs">
        {[
          { label: "All Content", value: "ALL" },
          { label: "Drafts", value: "DRAFT" },
          { label: "Pending Approval", value: "PENDING_APPROVAL" },
          { label: "Scheduled", value: "SCHEDULED" },
          { label: "Published", value: "PUBLISHED" },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              activeTab === tab.value
                ? "bg-blue-50 text-blue-700 ring-1 ring-blue-600/20"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Items List */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-slate-200" />
          ))}
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="space-y-4">
          {filteredItems.map((item) => {
            const platforms = JSON.parse(item.platforms || "[]");
            return (
              <div
                key={item.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-slate-300 md:flex-row md:items-center"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${getStatusBadge(
                        item.status
                      )}`}
                    >
                      {item.status.replace("_", " ")}
                    </span>
                    <span className="text-xs text-slate-400">
                      Created {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                  <p className="text-xs text-slate-600 max-w-2xl line-clamp-2">{item.bodyText}</p>

                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[11px] text-slate-400">Channels:</span>
                    {platforms.map((p: string) => (
                      <span
                        key={p}
                        className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-3 border-t border-slate-100 pt-3 md:mt-0 md:border-0 md:pt-0">
                  {item.scheduledFor && (
                    <div className="text-right text-xs">
                      <p className="font-semibold text-slate-700">Scheduled Date</p>
                      <p className="text-[11px] text-slate-400">
                        {new Date(item.scheduledFor).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  <button
                    onClick={() => alert(`Opening post editor for: "${item.title}"`)}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    View / Edit
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white py-16 text-center">
          <FileText className="h-8 w-8 text-slate-400" />
          <h3 className="mt-3 text-sm font-bold text-slate-900">No content items</h3>
          <p className="mt-1 text-xs text-slate-500">
            No posts found in this status category for this client.
          </p>
        </div>
      )}
    </div>
  );
}
