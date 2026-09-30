import type { Metadata } from "next";
import "./globals.css";
import { getCurrentUser } from "@/lib/auth";
import { WorkspaceProvider } from "@/context/WorkspaceContext";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "Social Command Center — Multi-Client Agency Platform",
  description: "Enterprise multi-client social media management platform for modern digital agencies.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialUser = await getCurrentUser();

  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased">
        <WorkspaceProvider initialUser={initialUser}>
          <AppShell>{children}</AppShell>
        </WorkspaceProvider>
      </body>
    </html>
  );
}
