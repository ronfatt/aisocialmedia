"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import {
  Share2,
  AlertCircle,
  ShieldCheck,
  Lock,
  X,
  Info,
} from "lucide-react";

export default function SocialAccountsPage() {
  const params = useParams();
  const clientId = params.clientId as string;

  const [modalPlatform, setModalPlatform] = useState<string | null>(null);

  const platforms = [
    {
      platform: "FACEBOOK",
      displayName: "Facebook",
      description: "Connect Facebook Pages and community groups to publish updates and track engagement.",
      status: "Integration Pending",
      requiredScopes: [
        "pages_show_list",
        "pages_read_engagement",
        "pages_manage_posts",
        "pages_manage_metadata",
      ],
    },
    {
      platform: "INSTAGRAM",
      displayName: "Instagram",
      description: "Connect Instagram Professional account for reels, feed carousel posts, and direct DM management.",
      status: "Integration Pending",
      requiredScopes: [
        "instagram_basic",
        "instagram_content_publish",
        "instagram_manage_comments",
        "instagram_manage_insights",
      ],
    },
    {
      platform: "TIKTOK",
      displayName: "TikTok",
      description: "Connect TikTok for Business account for direct short-form video publishing and performance metrics.",
      status: "Integration Pending",
      requiredScopes: [
        "user.info.basic",
        "video.list",
        "video.upload",
        "video.publish",
      ],
    },
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Social Media Accounts
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Client-isolated social channels and publishing permissions.
        </p>
      </div>

      {/* Security Architecture Banner */}
      <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4 text-xs text-blue-900">
        <div className="flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Multi-Tenant Credential Safety</p>
            <p className="text-blue-700 leading-relaxed">
              Every social account belongs strictly to this client workspace. In accordance with
              security guidelines, social platform passwords are never stored. Live Meta Graph API
              and TikTok for Business OAuth integrations will be connected in future phases.
            </p>
          </div>
        </div>
      </div>

      {/* Social Provider Cards Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {platforms.map((account) => (
          <div
            key={account.platform}
            className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs transition-all hover:border-slate-300"
          >
            <div>
              {/* Platform Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 font-bold text-white shadow-2xs text-sm">
                    {account.platform[0]}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      {account.displayName}
                    </h2>
                    <p className="text-[11px] text-slate-400 font-medium">Channel</p>
                  </div>
                </div>

                {/* Status Badge */}
                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-amber-50 text-amber-700 ring-1 ring-amber-600/20 ring-inset">
                  {account.status}
                </span>
              </div>

              <p className="mt-3 text-xs text-slate-600 leading-relaxed">
                {account.description}
              </p>

              {/* Scope Spec */}
              <div className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-xs">
                <span className="font-bold text-slate-500 text-[10px] uppercase tracking-wider">
                  Reserved Permission Scopes:
                </span>
                <div className="flex flex-wrap gap-1">
                  {account.requiredScopes.map((scope) => (
                    <span
                      key={scope}
                      className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-mono text-slate-600"
                    >
                      {scope}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="mt-6 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setModalPlatform(account.displayName)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-xs font-semibold text-white shadow-2xs hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <Lock className="h-3.5 w-3.5" />
                <span>Connect {account.displayName}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* INFORMATIONAL CONNECT MODAL (Section 14) */}
      {modalPlatform && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <Info className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">
                  {modalPlatform} Integration Notice
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Integration will be enabled in the Social API phase.
                </p>
                <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
                  In accordance with Phase 2 requirements, real OAuth flows and credential exchanges
                  are reserved for future phases. Usernames and passwords are never requested.
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setModalPlatform(null)}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 cursor-pointer"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
