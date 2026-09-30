"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles, Lock, Mail, ArrowRight, ShieldCheck, UserCheck } from "lucide-react";
import { MOCK_USERS } from "@/lib/mockUsers";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/clients";
  const sessionExpired = searchParams.get("expired") === "true";
  const unauthorized = searchParams.get("unauthorized") === "true";

  const [email, setEmail] = useState("sarah.chen@apexmedia.io");
  const [password, setPassword] = useState("password123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (loginEmail?: string) => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginEmail || email,
          password: password || "password123",
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Login failed");
      }

      // Hard redirect to clear client-side state
      window.location.href = redirectUrl;
    } catch (err: any) {
      setError(err.message || "Failed to log in");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-900 text-white flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-xl mb-4">
          <Sparkles className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Social Command Center</h1>
        <p className="mt-1 text-xs text-slate-400">
          Agency Multi-Client Social Management Operating System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="rounded-2xl border border-slate-800 bg-slate-800/80 p-8 shadow-2xl backdrop-blur-xl">
          {sessionExpired && (
            <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300">
              Your session has expired. Please log in again.
            </div>
          )}

          {unauthorized && (
            <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
              Access denied: Please sign in with an authorized agency account.
            </div>
          )}

          {error && (
            <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
              {error}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-semibold text-slate-300">Agency Email</label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/90 pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-hidden"
                  placeholder="name@agency.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300">Password</label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/90 pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-hidden"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-xs font-semibold text-white shadow-lg hover:bg-blue-500 transition-all disabled:opacity-50 cursor-pointer mt-2"
            >
              <span>{loading ? "Signing in..." : "Sign in to Command Center"}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </form>

          {/* Quick Demo Role Switcher */}
          <div className="mt-8 border-t border-slate-700/60 pt-6">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 text-center">
              Quick Role Test Logins
            </p>
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {MOCK_USERS.map((u) => (
                <button
                  key={u.email}
                  type="button"
                  onClick={() => {
                    setEmail(u.email);
                    handleLogin(u.email);
                  }}
                  className="w-full flex items-center justify-between rounded-xl border border-slate-700/50 bg-slate-900/60 p-2.5 text-left text-xs hover:border-blue-500 hover:bg-slate-900 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={u.avatarUrl!}
                      alt=""
                      className="h-6 w-6 rounded-full object-cover shrink-0"
                    />
                    <div className="truncate">
                      <p className="font-semibold text-slate-200">{u.name}</p>
                      <p className="text-[10px] text-slate-400">{u.email}</p>
                    </div>
                  </div>
                  <span className="rounded-md bg-blue-500/10 px-2 py-0.5 text-[9px] font-bold text-blue-400">
                    {u.role}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 text-center text-[11px] text-slate-500">
          Multi-Tenant Agency Operating System • Phase 2 Verified
        </div>
      </div>
    </div>
  );
}
