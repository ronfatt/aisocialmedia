"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  ArrowRight,
  Filter,
  Eye,
  Layers,
  Sparkles,
  MessageSquare,
} from "lucide-react";

export default function AgencyApprovalsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("PENDING");

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/approvals?status=${activeTab}`);
      if (res.ok) {
        const json = await res.json();
        setRequests(json.requests || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, [activeTab]);

  return (
    <div className="space-y-6 pb-20">
      {/* Page Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-purple-50 px-2 py-0.5 text-xs font-semibold text-purple-700 ring-1 ring-purple-600/20">
              Agency Master Queue
            </span>
            <span className="text-xs text-slate-400">Multi-Client Governance</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Creative Approval Center
          </h1>
          <p className="text-xs text-slate-500">
            Cross-client review queue for pending content drafts, platform variants, and client revision requests.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1.5 rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xs">
        {[
          { label: "Pending Approvals", value: "PENDING" },
          { label: "Changes Requested", value: "CHANGES_REQUESTED" },
          { label: "Approved (Ready to Schedule)", value: "APPROVED" },
          { label: "All Requests", value: "ALL" },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              activeTab === tab.value
                ? "bg-slate-900 text-white shadow-2xs"
                : "text-slate-600 hover:text-slate-900 bg-slate-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Approvals Table / Card List */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-slate-200" />
          ))}
        </div>
      ) : requests.length > 0 ? (
        <div className="space-y-4">
          {requests.map((req) => {
            const content = req.contentItem;
            const client = req.client;
            return (
              <div
                key={req.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs transition-all hover:border-slate-300 md:flex-row md:items-center gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Client Name Badge */}
                    <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-700">
                      <Building2 className="h-3 w-3" />
                      {client?.companyName}
                    </span>

                    {/* Status Badge */}
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${
                        req.status === "APPROVED"
                          ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
                          : req.status === "CHANGES_REQUESTED"
                          ? "bg-rose-50 text-rose-700 ring-rose-600/20"
                          : "bg-amber-50 text-amber-700 ring-amber-600/20"
                      }`}
                    >
                      {req.status.replace("_", " ")}
                    </span>

                    <span className="text-[11px] text-slate-400">
                      Submitted by {req.requestedBy} • {new Date(req.submittedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">
                    {content?.title || "Untitled Content"}
                  </h3>

                  {/* Platform Variants Status */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-[11px] text-slate-400">Variants:</span>
                    {content?.variants?.map((v: any) => (
                      <span
                        key={v.id}
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold border ${
                          v.approvalStatus === "APPROVED"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : v.approvalStatus === "CHANGES_REQUESTED"
                            ? "bg-rose-50 text-rose-800 border-rose-200"
                            : "bg-amber-50 text-amber-800 border-amber-200"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            v.approvalStatus === "APPROVED"
                              ? "bg-emerald-500"
                              : v.approvalStatus === "CHANGES_REQUESTED"
                              ? "bg-rose-500"
                              : "bg-amber-500"
                          }`}
                        />
                        {v.platform}
                      </span>
                    ))}
                  </div>

                  {req.reviewComment && (
                    <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-100 flex items-start gap-1.5 mt-2">
                      <MessageSquare className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                      <span>{req.reviewComment}</span>
                    </p>
                  )}
                </div>

                {/* Action Link */}
                <div className="shrink-0 flex items-center gap-2">
                  <Link
                    href={`/clients/${req.clientId}/content/${req.contentItemId}/review`}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-slate-800 transition-colors"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>Review & Act</span>
                    <ArrowRight className="h-3.5 w-3.5 ml-0.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-3">
            <CheckCircle2 className="h-6 w-6 text-emerald-500" />
          </div>
          <h3 className="text-base font-bold text-slate-900">All clear!</h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm">
            No approval requests matching status &quot;{activeTab}&quot; at this time.
          </p>
        </div>
      )}
    </div>
  );
}
