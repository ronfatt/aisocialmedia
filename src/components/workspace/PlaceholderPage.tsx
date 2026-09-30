"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Construction, ArrowLeft } from "lucide-react";

export function PlaceholderPage({
  title,
  description,
  plannedPhase = "Phase 2",
}: {
  title: string;
  description: string;
  plannedPhase?: string;
}) {
  const params = useParams();
  const clientId = params.clientId as string;

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xs">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 ring-8 ring-blue-50/50 mb-4">
        <Construction className="h-7 w-7" />
      </div>

      <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 mb-3">
        <span>Module not enabled yet.</span>
      </div>

      <h1 className="text-xl font-bold tracking-tight text-slate-900">{title}</h1>
      <p className="mt-2 text-xs text-slate-500 max-w-md leading-relaxed">{description}</p>

      <div className="mt-6 flex items-center gap-3">
        <Link
          href={`/clients/${clientId}/overview`}
          className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Client Overview</span>
        </Link>
      </div>
    </div>
  );
}
