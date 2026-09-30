import React from "react";
import Link from "next/link";
import { assertClientAccess, getCurrentUser } from "@/lib/auth";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export default async function ClientWorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const user = await getCurrentUser();
  const auth = await assertClientAccess(clientId, user);

  if (!auth.allowed) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center p-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600 ring-8 ring-red-50/50 mb-4">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Multi-Tenant Access Restriction</h2>
        <p className="mt-2 text-sm text-slate-500 max-w-md">
          {auth.error ||
            "You are not assigned to this client workspace. Under the agency multi-tenant security policy, cross-client access is strictly restricted."}
        </p>

        <div className="mt-6 flex items-center gap-3">
          <Link
            href="/clients"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Permitted Clients</span>
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
