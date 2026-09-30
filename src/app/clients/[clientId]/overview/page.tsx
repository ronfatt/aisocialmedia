"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useWorkspace } from "@/context/WorkspaceContext";
import {
  Share2,
  Calendar,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
} from "lucide-react";

export default function ClientOverviewPage() {
  const params = useParams();
  const clientId = params.clientId as string;
  const { activeClient } = useWorkspace();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOverview() {
      try {
        const res = await fetch(`/api/clients/${clientId}`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error("Failed to load client overview", err);
      } finally {
        setLoading(false);
      }
    }
    loadOverview();
  }, [clientId]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-28 rounded-2xl bg-slate-200" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-slate-200" />
          ))}
        </div>
      </div>
    );
  }

  const client = data?.client;
  const contentStats = data?.contentStats || {
    drafts: 0,
    pendingApproval: 0,
    approved: 0,
    scheduled: 0,
    published: 0,
  };
  const scheduledThisWeek = data?.scheduledThisWeek || 0;
  const platformDistribution = data?.platformDistribution || {
    Facebook: 0,
    Instagram: 0,
    TikTok: 0,
  };
  const strategy = client?.strategy;
  const activityLogs = client?.activityLogs || [];

  return (
    <div className="space-y-8">
      {/* 1. Client Identity Workspace Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden font-bold text-slate-700 shadow-xs">
              {client?.logoUrl ? (
                <img src={client.logoUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <Building2 className="h-7 w-7 text-slate-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  {client?.name}
                </h1>
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-600/20 ring-inset">
                  {client?.status || "ACTIVE"}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-500">
                {client?.industry} • {client?.locationCity}, {client?.locationState},{" "}
                {client?.locationCountry}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/clients/${clientId}/profile`}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Edit Master Profile
            </Link>
            <Link
              href={`/clients/${clientId}/strategy`}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Marketing Strategy</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Top Metric Panels: Social Connections & Content Summary */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Panel A: Social Connections */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Social Connections
              </h2>
              <Link
                href={`/clients/${clientId}/social-accounts`}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800"
              >
                Manage →
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {["FACEBOOK", "INSTAGRAM", "TIKTOK"].map((pName) => {
                const acct = client?.socialAccounts?.find((s: any) => s.platform === pName);
                const isConnected = acct?.connectionStatus === "CONNECTED";

                return (
                  <div
                    key={pName}
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 p-3"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-xs text-xs font-bold text-slate-700">
                        {pName[0]}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 capitalize">
                          {pName.toLowerCase()}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {isConnected
                            ? acct?.username || acct?.displayName
                            : "Channel Not Connected"}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        isConnected
                          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20"
                          : "bg-slate-200/60 text-slate-600"
                      }`}
                    >
                      {isConnected ? (
                        <>
                          <CheckCircle2 className="h-3 w-3" />
                          Connected
                        </>
                      ) : (
                        "Not Connected"
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Panel B: Content Pipeline Summary */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Content Summary
              </h2>
              <Link
                href={`/clients/${clientId}/content`}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800"
              >
                View Content Pipeline →
              </Link>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
              <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 text-center">
                <span className="block text-2xl font-bold text-slate-900">
                  {contentStats.drafts}
                </span>
                <span className="text-[11px] font-semibold text-slate-500">Drafts</span>
              </div>

              <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-3 text-center">
                <span className="block text-2xl font-bold text-amber-700">
                  {contentStats.pendingApproval}
                </span>
                <span className="text-[11px] font-semibold text-amber-600">Pending Approval</span>
              </div>

              <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3 text-center">
                <span className="block text-2xl font-bold text-blue-700">
                  {contentStats.approved}
                </span>
                <span className="text-[11px] font-semibold text-blue-600">Approved</span>
              </div>

              <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3 text-center">
                <span className="block text-2xl font-bold text-indigo-700">
                  {contentStats.scheduled}
                </span>
                <span className="text-[11px] font-semibold text-indigo-600">Scheduled</span>
              </div>

              <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3 text-center">
                <span className="block text-2xl font-bold text-emerald-700">
                  {contentStats.published}
                </span>
                <span className="text-[11px] font-semibold text-emerald-600">Published</span>
              </div>
            </div>
          </div>

          {/* This Week Section */}
          <div className="mt-5 border-t border-slate-100 pt-4">
            <h3 className="text-xs font-bold text-slate-700">This Week</h3>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span>
                  Posts Scheduled This Week:{" "}
                  <strong className="text-slate-900">{scheduledThisWeek}</strong>
                </span>
              </div>

              {/* Platform Distribution */}
              <div className="flex items-center gap-3">
                <span className="text-slate-400">Distribution:</span>
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                  FB: {platformDistribution.Facebook}
                </span>
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                  IG: {platformDistribution.Instagram}
                </span>
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                  TT: {platformDistribution.TikTok}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Marketing Strategy Snapshot & Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Marketing Strategy Snapshot */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-900">Marketing Strategy Snapshot</h2>
            </div>
            <Link
              href={`/clients/${clientId}/strategy`}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              Full Strategy & Pillars →
            </Link>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="font-bold text-slate-400 uppercase text-[10px]">
                Current Focus / Positioning
              </span>
              <p className="mt-0.5 text-slate-800 font-medium leading-relaxed">
                {strategy?.brandPositioning || "Positioning strategy definition pending."}
              </p>
            </div>

            <div>
              <span className="font-bold text-slate-400 uppercase text-[10px]">Target Market</span>
              <p className="mt-0.5 text-slate-700 leading-relaxed">
                {strategy?.targetAudience || client?.targetMarket?.geographicTarget || "Target audience definition pending."}
              </p>
            </div>

            <div>
              <span className="font-bold text-slate-400 uppercase text-[10px]">
                Content Pillars ({strategy?.pillars?.length || 0})
              </span>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {strategy?.pillars?.map((pillar: any, idx: number) => (
                  <span
                    key={pillar.id || idx}
                    className="inline-flex items-center rounded-lg border border-indigo-100 bg-indigo-50/70 px-2.5 py-1 text-xs font-medium text-indigo-800"
                  >
                    {idx + 1}. {pillar.title}
                  </span>
                ))}
                {(!strategy?.pillars || strategy.pillars.length === 0) && (
                  <span className="text-xs text-slate-400">No content pillars created yet</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Log */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-400" />
                <h2 className="text-sm font-bold text-slate-900">Recent Workspace Activity</h2>
              </div>
              <span className="text-[10px] text-slate-400">Internal Audit Trail</span>
            </div>

            <div className="mt-4 space-y-3">
              {activityLogs.length > 0 ? (
                activityLogs.map((log: any) => (
                  <div key={log.id} className="flex items-start gap-3 text-xs">
                    <div className="mt-1 h-2 w-2 rounded-full bg-blue-600 shrink-0" />
                    <div>
                      <p className="font-medium text-slate-800">{log.description}</p>
                      <span className="text-[10px] text-slate-400">
                        {new Date(log.createdAt).toLocaleString("en-GB", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">No data yet</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
