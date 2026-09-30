"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useWorkspace } from "@/context/WorkspaceContext";
import {
  Share2,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  PowerOff,
  Activity,
  Check,
  Building2,
  AlertCircle,
  HelpCircle,
  X,
  Video,
} from "lucide-react";

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

interface SocialAccountUI {
  id: string;
  platform: "FACEBOOK" | "INSTAGRAM" | "TIKTOK";
  displayName: string;
  username: string | null;
  profileImageUrl: string | null;
  platformAccountId: string | null;
  connectionStatus: string;
  accountType: string;
  permissionsGranted: string[];
  connectedBy: string | null;
  connectedAt: string | null;
  lastVerifiedAt: string | null;
  isConfigured: boolean;
}

interface DiscoveredAccount {
  id: string;
  name: string;
  username?: string;
  profilePictureUrl?: string;
  category?: string;
  accountType: string;
  platform: "FACEBOOK" | "INSTAGRAM";
}

export default function SocialAccountsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const clientId = params.clientId as string;
  const { activeClient } = useWorkspace();

  const [accounts, setAccounts] = useState<SocialAccountUI[]>([]);
  const [isMetaConfigured, setIsMetaConfigured] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal States
  const [safetyCheckPlatform, setSafetyCheckPlatform] = useState<"FACEBOOK" | "INSTAGRAM" | null>(null);
  const [isInitiatingOAuth, setIsInitiatingOAuth] = useState(false);

  // Discovery Selection Modal
  const [discoveryAccounts, setDiscoveryAccounts] = useState<DiscoveredAccount[]>([]);
  const [discoveryPlatform, setDiscoveryPlatform] = useState<"FACEBOOK" | "INSTAGRAM" | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [isSavingSelection, setIsSavingSelection] = useState(false);
  const [duplicateConflict, setDuplicateConflict] = useState<{ existingClientName: string } | null>(null);

  // Details Modal
  const [detailsAccount, setDetailsAccount] = useState<SocialAccountUI | null>(null);

  // Verify Test Modal
  const [testingAccountId, setTestingAccountId] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<any | null>(null);

  // Disconnect Confirmation Modal
  const [disconnectingAccount, setDisconnectingAccount] = useState<SocialAccountUI | null>(null);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  // Fetch accounts
  const fetchAccounts = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/clients/${clientId}/social-accounts`);
      const data = await res.json();
      if (res.ok) {
        setAccounts(data.accounts || []);
        setIsMetaConfigured(Boolean(data.isMetaConfigured));
      } else {
        setErrorMsg(data.error || "Failed to load social accounts");
      }
    } catch {
      setErrorMsg("Network error loading social accounts");
    } finally {
      setIsLoading(false);
    }
  }, [clientId]);

  // Check URL params for discovery callback or error
  useEffect(() => {
    fetchAccounts();

    const selectPlatformParam = searchParams.get("select_platform") as "FACEBOOK" | "INSTAGRAM" | null;
    const statusParam = searchParams.get("status");
    const errorParam = searchParams.get("error");
    const messageParam = searchParams.get("message");

    if (errorParam) {
      setErrorMsg(`Authorization Notice: ${messageParam || errorParam}`);
    }

    if (selectPlatformParam && statusParam === "discovery_ready") {
      setDiscoveryPlatform(selectPlatformParam);
      // Fetch discovered accounts
      fetch(`/api/clients/${clientId}/social-accounts/meta/discovery`)
        .then((res) => res.json())
        .then((data) => {
          if (data.accounts && data.accounts.length > 0) {
            setDiscoveryAccounts(data.accounts);
            setSelectedAccountId(data.accounts[0].id);
          } else {
            setErrorMsg(data.error || "No accounts found in authorization session");
          }
        })
        .catch(() => setErrorMsg("Failed to retrieve discovered accounts."));
    }
  }, [clientId, fetchAccounts, searchParams]);

  // Step 1: Client Safety Check $\to$ Initiate Meta OAuth
  const handleInitiateOAuth = async (platform: "FACEBOOK" | "INSTAGRAM", action: "CONNECT" | "RECONNECT" = "CONNECT", accountId?: string) => {
    setIsInitiatingOAuth(true);
    setErrorMsg(null);
    try {
      const query = new URLSearchParams({ platform, action });
      if (accountId) query.set("socialAccountId", accountId);

      const res = await fetch(`/api/clients/${clientId}/social-accounts/meta/connect?${query.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || data.message || "Failed to start connection");
        setIsInitiatingOAuth(false);
        setSafetyCheckPlatform(null);
        return;
      }

      // Redirect user's browser to the Meta OAuth dialog
      window.location.href = data.authUrl;
    } catch (err: any) {
      setErrorMsg(err.message || "Connection failed");
      setIsInitiatingOAuth(false);
      setSafetyCheckPlatform(null);
    }
  };

  // Step 5: Save Selected Discovered Account
  const handleConfirmAccountSelection = async () => {
    if (!selectedAccountId || !discoveryPlatform) return;
    setIsSavingSelection(true);
    setDuplicateConflict(null);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/clients/${clientId}/social-accounts/meta/select`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selectedAccountId,
          platform: discoveryPlatform,
        }),
      });

      const data = await res.json();

      if (res.status === 409) {
        // Section 16: Duplicate Account Protection
        setDuplicateConflict({ existingClientName: data.existingClientName || "another client workspace" });
        setIsSavingSelection(false);
        return;
      }

      if (!res.ok) {
        setErrorMsg(data.error || "Failed to connect account");
        setIsSavingSelection(false);
        return;
      }

      setSuccessMsg(`Successfully connected ${discoveryPlatform} account!`);
      setDiscoveryAccounts([]);
      setDiscoveryPlatform(null);
      // Clean up URL query parameters
      router.replace(`/clients/${clientId}/social-accounts`);
      fetchAccounts();
    } catch {
      setErrorMsg("Network error connecting account");
    } finally {
      setIsSavingSelection(false);
    }
  };

  // Test Connection
  const handleTestConnection = async (account: SocialAccountUI) => {
    setTestingAccountId(account.id);
    setVerificationResult(null);
    try {
      const res = await fetch(`/api/clients/${clientId}/social-accounts/${account.id}/verify`, {
        method: "POST",
      });
      const data = await res.json();
      setVerificationResult(data.result);
      fetchAccounts();
    } catch {
      setVerificationResult({
        healthy: false,
        status: "ERROR",
        message: "Failed to perform test connection.",
        lastVerifiedAt: new Date(),
      });
    } finally {
      setTestingAccountId(null);
    }
  };

  // Disconnect Account
  const handleDisconnect = async () => {
    if (!disconnectingAccount) return;
    setIsDisconnecting(true);
    try {
      const res = await fetch(`/api/clients/${clientId}/social-accounts/${disconnectingAccount.id}/disconnect`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(data.message || "Account disconnected successfully.");
        setDisconnectingAccount(null);
        fetchAccounts();
      } else {
        setErrorMsg(data.error || "Failed to disconnect account");
      }
    } catch {
      setErrorMsg("Error disconnecting account");
    } finally {
      setIsDisconnecting(false);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "FACEBOOK":
        return <FacebookIcon className="h-5 w-5 text-blue-600" />;
      case "INSTAGRAM":
        return <InstagramIcon className="h-5 w-5 text-pink-600" />;
      case "TIKTOK":
        return <Video className="h-5 w-5 text-slate-800" />;
      default:
        return <Share2 className="h-5 w-5 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Social Connections</h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 ring-1 ring-blue-600/20 ring-inset">
              <ShieldCheck className="h-3.5 w-3.5" />
              Meta Graph v26.0
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Connect and manage client-isolated Facebook Pages and Instagram Professional channels.
          </p>
        </div>

        <button
          onClick={fetchAccounts}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer shadow-2xs"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Error & Success Toasts */}
      {errorMsg && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700 flex items-start justify-between">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-red-400 hover:text-red-600">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {successMsg && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-700 flex items-start justify-between">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-400 hover:text-emerald-600">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Meta Configuration Advisory Banner if not configured */}
      {!isMetaConfigured && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-900 shadow-2xs">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">Meta Integration Not Configured</p>
              <p className="text-amber-800 leading-relaxed">
                <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">META_APP_ID</code> and{" "}
                <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">META_APP_SECRET</code> are not configured
                in your server environment. Real Facebook and Instagram OAuth authorization requires these keys.
                See setup instructions in <span className="font-semibold underline">docs/meta-setup.md</span>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Multi-Tenant Boundary Banner */}
      <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4 text-xs text-blue-900">
        <div className="flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Strict Tenant Data Isolation</p>
            <p className="text-blue-700 leading-relaxed">
              Social accounts belong strictly to <strong>{activeClient?.name || "this client"}</strong>. Tokens are
              encrypted at rest using AES-256-GCM and never returned to the frontend. Accounts cannot be accessed by or
              assigned to other clients.
            </p>
          </div>
        </div>
      </div>

      {/* Channel Cards Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {accounts.map((account) => {
          const isConnected = account.connectionStatus === "CONNECTED";
          const isTikTok = account.platform === "TIKTOK";

          return (
            <div
              key={account.platform}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs transition-all hover:border-slate-300"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 border border-slate-200 shadow-2xs">
                      {getPlatformIcon(account.platform)}
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-900 capitalize">
                        {account.platform.toLowerCase()}
                      </h2>
                      <p className="text-[11px] text-slate-400 font-medium">
                        {account.platform === "FACEBOOK"
                          ? "Facebook Page"
                          : account.platform === "INSTAGRAM"
                          ? "Instagram Professional"
                          : "Short-Form Video"}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      isConnected
                        ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20 ring-inset"
                        : !account.isConfigured && !isTikTok
                        ? "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20 ring-inset"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {isConnected
                      ? "Connected"
                      : !account.isConfigured && !isTikTok
                      ? "Integration Pending"
                      : "Not Connected"}
                  </span>
                </div>

                {/* Account Identity details if connected */}
                {isConnected ? (
                  <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/80 p-3 space-y-2">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-full bg-slate-200 overflow-hidden shrink-0">
                        {account.profileImageUrl ? (
                          <img src={account.profileImageUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center font-bold text-slate-600 text-xs">
                            {account.displayName.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-bold text-slate-900 truncate">{account.displayName}</p>
                        {account.username && (
                          <p className="text-[11px] text-slate-500 font-medium">{account.username}</p>
                        )}
                      </div>
                    </div>

                    <div className="border-t border-slate-200/60 pt-2 text-[11px] text-slate-500 space-y-1">
                      {account.connectedBy && (
                        <p>
                          Connected by: <span className="font-semibold text-slate-700">{account.connectedBy}</span>
                        </p>
                      )}
                      <p>
                        Last verified:{" "}
                        <span className="font-semibold text-slate-700">
                          {account.lastVerifiedAt
                            ? new Date(account.lastVerifiedAt).toLocaleString("en-US", {
                                dateStyle: "short",
                                timeStyle: "short",
                              })
                            : "Never"}
                        </span>
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="mt-4 text-xs text-slate-600 leading-relaxed min-h-[48px]">
                    {account.platform === "FACEBOOK"
                      ? "Connect a managed Facebook Page to publish updates, track engagement, and manage community interactions."
                      : account.platform === "INSTAGRAM"
                      ? "Connect an Instagram Business or Creator account to publish reels, carousel posts, and monitor metrics."
                      : "TikTok for Business integration will be available in an upcoming phase."}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 border-t border-slate-100 pt-4">
                {isTikTok ? (
                  <button
                    disabled
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 py-2.5 text-xs font-semibold text-slate-400 cursor-not-allowed"
                  >
                    TikTok Integration Deferred
                  </button>
                ) : isConnected ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setDetailsAccount(account)}
                        className="inline-flex items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                      >
                        View Details
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTestConnection(account)}
                        disabled={testingAccountId === account.id}
                        className="inline-flex items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer disabled:opacity-50"
                      >
                        <Activity className={`h-3 w-3 ${testingAccountId === account.id ? "animate-spin" : ""}`} />
                        <span>{testingAccountId === account.id ? "Testing..." : "Test"}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleInitiateOAuth(account.platform as any, "RECONNECT", account.id)}
                        className="inline-flex items-center justify-center gap-1 rounded-lg border border-blue-200 bg-blue-50 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 cursor-pointer"
                      >
                        <RefreshCw className="h-3 w-3" />
                        <span>Reconnect</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDisconnectingAccount(account)}
                        className="inline-flex items-center justify-center gap-1 rounded-lg border border-red-200 bg-red-50 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 cursor-pointer"
                      >
                        <PowerOff className="h-3 w-3" />
                        <span>Disconnect</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (!isMetaConfigured) {
                        setErrorMsg("Meta Integration Not Configured. Please add META_APP_ID in your .env file.");
                        return;
                      }
                      setSafetyCheckPlatform(account.platform as "FACEBOOK" | "INSTAGRAM");
                    }}
                    disabled={!isMetaConfigured}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-xs font-semibold text-white shadow-2xs hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>Connect {account.platform === "FACEBOOK" ? "Facebook" : "Instagram"}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* STEP 1: CLIENT SAFETY CHECK CONFIRMATION MODAL */}
      {safetyCheckPlatform && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="text-center space-y-3">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 border border-blue-200">
                {activeClient?.logoUrl ? (
                  <img src={activeClient.logoUrl} alt="" className="h-10 w-10 rounded-xl object-cover" />
                ) : (
                  <Building2 className="h-7 w-7 text-blue-600" />
                )}
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">Client Safety Check</p>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  Connect {safetyCheckPlatform === "FACEBOOK" ? "Facebook" : "Instagram"} to:
                </h3>
                <p className="text-base font-extrabold text-blue-600">{activeClient?.name}</p>
              </div>

              <div className="rounded-xl bg-amber-50 p-3 text-left text-xs text-amber-900 border border-amber-200">
                <p className="font-semibold">Workspace Isolation Guarantee:</p>
                <p className="mt-1 text-amber-800 leading-relaxed">
                  This social account will only be available inside the <strong>{activeClient?.name}</strong> workspace.
                  Please ensure you select this client&apos;s legitimate page during authorization.
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSafetyCheckPlatform(null)}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleInitiateOAuth(safetyCheckPlatform)}
                disabled={isInitiatingOAuth}
                className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 cursor-pointer disabled:opacity-50"
              >
                {isInitiatingOAuth ? "Redirecting to Meta..." : "Continue to Meta Authorization"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4 & 5: DISCOVERED ACCOUNT SELECTOR MODAL */}
      {discoveryPlatform && discoveryAccounts.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Select {discoveryPlatform === "FACEBOOK" ? "Facebook Page" : "Instagram Account"}
                </h3>
                <p className="text-xs text-slate-500">
                  Choose which authorized account to connect to <strong>{activeClient?.name}</strong>.
                </p>
              </div>
              <button
                onClick={() => {
                  setDiscoveryAccounts([]);
                  setDiscoveryPlatform(null);
                  router.replace(`/clients/${clientId}/social-accounts`);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Duplicate Conflict Error Display */}
            {duplicateConflict && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Duplicate Connection Blocked</p>
                    <p className="mt-1">
                      This social account is already connected to{" "}
                      <span className="font-semibold underline">{duplicateConflict.existingClientName}</span>. A social
                      account cannot belong to two clients simultaneously.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Accounts Radio List */}
            <div className="mt-4 max-h-64 overflow-y-auto space-y-2 pr-1">
              {discoveryAccounts.map((acc) => {
                const isSelected = selectedAccountId === acc.id;
                return (
                  <label
                    key={acc.id}
                    onClick={() => setSelectedAccountId(acc.id)}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? "border-blue-500 bg-blue-50/50 ring-1 ring-blue-500"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-slate-200 overflow-hidden shrink-0">
                        {acc.profilePictureUrl ? (
                          <img src={acc.profilePictureUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center font-bold text-xs text-slate-600">
                            {acc.name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{acc.name}</p>
                        <p className="text-[11px] text-slate-500">
                          {acc.username || acc.category || `ID: ${acc.id}`}
                        </p>
                      </div>
                    </div>

                    <div
                      className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                        isSelected ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300"
                      }`}
                    >
                      {isSelected && <Check className="h-2.5 w-2.5" />}
                    </div>
                  </label>
                );
              })}
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => {
                  setDiscoveryAccounts([]);
                  setDiscoveryPlatform(null);
                  router.replace(`/clients/${clientId}/social-accounts`);
                }}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAccountSelection}
                disabled={!selectedAccountId || isSavingSelection}
                className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 cursor-pointer disabled:opacity-50"
              >
                {isSavingSelection ? "Connecting..." : "Connect Selected Account"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 12: CONNECTION DETAILS MODAL */}
      {detailsAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                {getPlatformIcon(detailsAccount.platform)}
                <h3 className="text-base font-bold text-slate-900">
                  {detailsAccount.displayName} Details
                </h3>
              </div>
              <button onClick={() => setDetailsAccount(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-3 border border-slate-100">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">Platform</span>
                  <p className="font-bold text-slate-800">{detailsAccount.platform}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">Status</span>
                  <p className="font-bold text-emerald-600">{detailsAccount.connectionStatus}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">Account ID</span>
                  <p className="font-mono text-slate-700">{detailsAccount.platformAccountId || "N/A"}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">Connected By</span>
                  <p className="font-semibold text-slate-700">{detailsAccount.connectedBy || "System"}</p>
                </div>
              </div>

              <div>
                <span className="text-slate-500 font-bold text-[11px]">Permission Scopes Status:</span>
                <div className="mt-2 space-y-1.5">
                  <div className="flex items-center justify-between rounded-lg border border-slate-100 p-2">
                    <span>Page / Profile Access:</span>
                    <span className="font-semibold text-emerald-600">Granted</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-slate-100 p-2">
                    <span>Content Publishing:</span>
                    <span className="font-semibold text-emerald-600">Granted</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-slate-100 p-2">
                    <span>Insights & Analytics:</span>
                    <span className="font-semibold text-emerald-600">Granted</span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-[11px] text-slate-500">
                🔒 Access tokens are encrypted at rest with AES-256-GCM. Raw credentials are never transmitted to browser code.
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setDetailsAccount(null)}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 13: TEST CONNECTION RESULT MODAL */}
      {verificationResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-4">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
                  verificationResult.healthy ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                }`}
              >
                {verificationResult.healthy ? <CheckCircle2 className="h-6 w-6" /> : <AlertTriangle className="h-6 w-6" />}
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">
                  {verificationResult.healthy ? "Connection Healthy" : "Verification Issue"}
                </h3>
                <p className="text-xs text-slate-600">{verificationResult.message}</p>
                <p className="text-[11px] text-slate-400 pt-1">
                  Verified at: {new Date(verificationResult.lastVerifiedAt).toLocaleTimeString()}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setVerificationResult(null)}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 15: DISCONNECT CONFIRMATION MODAL */}
      {disconnectingAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
                <PowerOff className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">Disconnect Social Account</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Disconnect <strong>{disconnectingAccount.displayName}</strong> from{" "}
                  <strong>{activeClient?.name}</strong>?
                </p>
                <p className="text-[11px] text-slate-500 pt-1">
                  This stops future API publishing access and invalidates stored credentials. Historical posts and
                  internal activity logs will remain preserved.
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDisconnectingAccount(null)}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDisconnect}
                disabled={isDisconnecting}
                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-red-700 cursor-pointer disabled:opacity-50"
              >
                {isDisconnecting ? "Disconnecting..." : "Disconnect Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
