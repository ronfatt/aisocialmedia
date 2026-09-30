import type { Metadata } from "next";
import "./globals.css";
import { getCurrentUser } from "@/lib/auth";
import { WorkspaceProvider } from "@/context/WorkspaceContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

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
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex flex-1 flex-col pl-64">
              <Topbar />
              <main className="flex-1 p-6 md:p-8">{children}</main>
            </div>
          </div>
        </WorkspaceProvider>
      </body>
    </html>
  );
}
