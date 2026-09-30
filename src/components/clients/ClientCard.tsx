"use client";

import React from "react";
import Link from "next/link";
import { ClientListItem } from "@/types";
import {
  Building2,
  Calendar,
  Clock,
  MapPin,
  User,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Share2,
} from "lucide-react";

export function ClientCard({ client }: { client: ClientListItem }) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-emerald-50 text-emerald-700 ring-emerald-600/20";
      case "ONBOARDING":
        return "bg-blue-50 text-blue-700 ring-blue-600/20";
      case "PAUSED":
        return "bg-amber-50 text-amber-700 ring-amber-600/20";
      case "ARCHIVED":
        return "bg-slate-100 text-slate-600 ring-slate-500/20";
      default:
        return "bg-slate-100 text-slate-700 ring-slate-500/20";
    }
  };

  const getPlatformStatus = (status: string) => {
    const isConnected = status === "CONNECTED";
    return {
      connected: isConnected,
      label: isConnected ? "Connected" : "Not Connected",
      color: isConnected ? "text-emerald-700 bg-emerald-50" : "text-slate-500 bg-slate-100",
    };
  };

  const fbStatus = getPlatformStatus(client.facebookStatus);
  const igStatus = getPlatformStatus(client.instagramStatus);
  const ttStatus = getPlatformStatus(client.tiktokStatus);

  const formattedDate = new Date(client.lastActivityDate || client.createdAt).toLocaleDateString(
    "en-GB",
    { day: "numeric", month: "short", year: "numeric" }
  );

  return (
    <Link
      href={`/clients/${client.id}/overview`}
      className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-blue-400 hover:shadow-lg"
    >
      <div>
        {/* Top Header: Logo, Name, Location, Status */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 overflow-hidden font-bold text-slate-700 shadow-xs group-hover:border-blue-300">
              {client.logoUrl ? (
                <img
                  src={client.logoUrl}
                  alt={client.name}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
              ) : (
                <Building2 className="h-6 w-6 text-slate-400" />
              )}
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                {client.name}
              </h3>
              <p className="text-xs font-semibold text-slate-600">{client.industry}</p>
              <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-400">
                <MapPin className="h-3 w-3" />
                <span>
                  {client.locationCity}, {client.locationState}
                </span>
              </div>
            </div>
          </div>

          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${getStatusBadge(
              client.status
            )}`}
          >
            {client.status}
          </span>
        </div>

        {/* Account Manager */}
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-1.5 text-xs text-slate-600">
          <User className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-slate-400">Manager:</span>
          <span className="font-semibold text-slate-700">{client.accountManagerName || "Unassigned"}</span>
        </div>

        {/* Social Accounts Connection Matrix */}
        <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Social Channels
          </p>

          <div className="grid grid-cols-3 gap-2">
            {/* Facebook */}
            <div className={`flex flex-col rounded-lg p-2 text-center text-xs font-medium ${fbStatus.color}`}>
              <span className="text-[10px] font-bold">Facebook</span>
              <span className="text-[10px] mt-0.5">{fbStatus.label}</span>
            </div>

            {/* Instagram */}
            <div className={`flex flex-col rounded-lg p-2 text-center text-xs font-medium ${igStatus.color}`}>
              <span className="text-[10px] font-bold">Instagram</span>
              <span className="text-[10px] mt-0.5">{igStatus.label}</span>
            </div>

            {/* TikTok */}
            <div className={`flex flex-col rounded-lg p-2 text-center text-xs font-medium ${ttStatus.color}`}>
              <span className="text-[10px] font-bold">TikTok</span>
              <span className="text-[10px] mt-0.5">{ttStatus.label}</span>
            </div>
          </div>
        </div>

        {/* Operational Metrics: Scheduled Posts & Pending Approvals */}
        <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-2.5 text-center">
            <span className="block text-lg font-bold text-slate-900">{client.scheduledPostsCount}</span>
            <span className="text-[11px] font-medium text-slate-500">Scheduled Posts</span>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-2.5 text-center">
            <span className={`block text-lg font-bold ${client.pendingApprovalsCount > 0 ? "text-amber-600" : "text-slate-900"}`}>
              {client.pendingApprovalsCount}
            </span>
            <span className="text-[11px] font-medium text-slate-500">Pending Approvals</span>
          </div>
        </div>
      </div>

      {/* Footer: Last Activity & Open Workspace Callout */}
      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
        <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
          <Clock className="h-3 w-3" />
          <span>Active: {formattedDate}</span>
        </div>

        <span className="inline-flex items-center gap-1 font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform">
          Open Workspace
          <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  );
}
