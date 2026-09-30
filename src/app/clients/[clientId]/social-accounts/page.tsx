"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Share2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Lock,
  ExternalLink,
  RefreshCw,
  Info,
} from "lucide-react";

export default function SocialAccountsPage() {
  const params = useParams();
  const clientId = params.clientId as string;

  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchAccounts = async () => {
    try {
      const res = await fetch(`/api/clients/${clientId}/social-accounts`);
      if (res.ok) {
        const json = await res.json();
        setAccounts(json.accounts || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [clientId]);

  const toggleConnection = async (platform: string, currentStatus: string) => {
    setActionLoading(platform);
    try {
      const res = await fetch(`/api/clients/${clientId}/social-accounts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform,
          action: currentStatus === "CONNECTED" ? "disconnect" : "connect",
          accountName: `${platform} Official Page`,
        }),
      });
      if (res.ok) {
        await fetchAccounts();
      }
    } catch (err) {
      console.error("Connection toggle failed", err);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return <div className="h-80 rounded-2xl bg-slate-200 animate-pulse" />;
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Social Media Accounts
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Configure client-isolated social credentials, permission scopes, and publishing channels.
        </p>
      </div>

      {/* Security Architecture Notice */}
      <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4 text-xs text-blue-900">
        <div className="flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Multi-Tenant Credential Isolation</p>
            <p className="text-blue-700 leading-relaxed">
              Every social account belongs strictly to this client workspace. In accordance with
              Phase 1 requirements, live Meta Graph API and TikTok for Business OAuth authorization
              flows are architected via modular provider classes and labeled as{" "}
              <strong className="underline decoration-blue-400">Integration Pending</strong>. Real
              passwords are never requested or stored; tokens are encrypted at rest with AES-256-GCM.
            </p>
          </div>
        </div>
      </div>

      {/* Social Providers Cards Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {accounts.map((account) => {
          const isConnected = account.connectionStatus === "CONNECTED";
          const isPending = account.connectionStatus === "PENDING_INTEGRATION";

          return (
            <div
              key={account.platform}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition-all hover:border-slate-300"
            >
              <div>
                {/* Platform Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 font-bold text-white shadow-xs text-sm">
                      {account.platform[0]}
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-900 capitalize">
                        {account.platform.toLowerCase()}
                      </h2>
                      <p className="text-[11px] text-slate-400 font-medium">
                        {account.displayName || "Channel"}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${
                      isConnected
                        ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
                        : "bg-amber-50 text-amber-700 ring-amber-600/20"
                    }`}
                  >
                    {isConnected ? "Connected" : "Integration Pending"}
                  </span>
                </div>

                {/* Scope & Capability Spec */}
                <div className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-xs">
                  <span className="font-bold text-slate-500 text-[10px] uppercase tracking-wider">
                    Required Scopes & Permissions:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {account.requiredScopes.map((scope: string) => (
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
                {isConnected ? (
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                      <CheckCircle2 className="h-4 w-4" />
                      Active Link
                    </span>
                    <button
                      type="button"
                      disabled={actionLoading === account.platform}
                      onClick={() => toggleConnection(account.platform, account.connectionStatus)}
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      Disconnect
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={actionLoading === account.platform}
                    onClick={() => toggleConnection(account.platform, account.connectionStatus)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 disabled:opacity-50 cursor-pointer"
                  >
                    <Lock className="h-3.5 w-3.5" />
                    <span>Connect {account.platform.toLowerCase()}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
