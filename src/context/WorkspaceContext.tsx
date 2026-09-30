"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AuthenticatedUser, ClientListItem } from "@/types";

interface WorkspaceContextType {
  activeUser: AuthenticatedUser | null;
  setActiveUser: (user: AuthenticatedUser) => void;
  logout: () => Promise<void>;
  clients: ClientListItem[];
  setClients: React.Dispatch<React.SetStateAction<ClientListItem[]>>;
  activeClient: ClientListItem | null;
  setActiveClient: (client: ClientListItem | null) => void;
  isDirty: boolean;
  setIsDirty: (dirty: boolean) => void;
  switchClient: (clientId: string) => void;
  pendingClientId: string | null;
  confirmDiscardAndSwitch: () => void;
  cancelSwitch: () => void;
  refreshClients: () => Promise<void>;
  isLoading: boolean;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({
  children,
  initialUser,
}: {
  children: React.ReactNode;
  initialUser: AuthenticatedUser | null;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [activeUser, setActiveUserState] = useState<AuthenticatedUser | null>(initialUser);
  const [clients, setClients] = useState<ClientListItem[]>([]);
  const [activeClient, setActiveClient] = useState<ClientListItem | null>(null);
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [pendingClientId, setPendingClientId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Sync user in cookie and reload for SSR consistency
  const setActiveUser = async (user: AuthenticatedUser) => {
    setActiveUserState(user);
    await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: user.email }),
    });
    window.location.reload();
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setActiveUserState(null);
    window.location.href = "/login";
  };

  const refreshClients = async () => {
    if (!activeUser) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/clients");
      if (res.ok) {
        const data = await res.json();
        setClients(data.clients || []);
      }
    } catch (e) {
      console.error("Failed to load clients", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshClients();
  }, [activeUser?.email]);

  // Keep activeClient in sync with URL
  useEffect(() => {
    const match = pathname.match(/\/clients\/([^\/]+)/);
    if (match && match[1] && match[1] !== "new") {
      const cId = match[1];
      const found = clients.find((c) => c.id === cId || c.slug === cId);
      if (found) {
        setActiveClient(found);
      }
    } else if (pathname === "/clients" || pathname === "/clients/new") {
      setActiveClient(null);
    }
  }, [pathname, clients]);

  const switchClient = (clientId: string) => {
    if (isDirty) {
      setPendingClientId(clientId);
      return;
    }
    executeSwitch(clientId);
  };

  const executeSwitch = (clientId: string) => {
    setIsDirty(false);
    setPendingClientId(null);

    // Calculate equivalent subpath (e.g. /clients/a/content -> /clients/b/content)
    const match = pathname.match(/\/clients\/[^\/]+(\/.*)?$/);
    const subpath = match && match[1] ? match[1] : "/overview";

    const target = clients.find((c) => c.id === clientId || c.slug === clientId);
    const targetId = target ? target.id : clientId;

    router.push(`/clients/${targetId}${subpath}`);
  };

  const confirmDiscardAndSwitch = () => {
    if (pendingClientId) {
      executeSwitch(pendingClientId);
    }
  };

  const cancelSwitch = () => {
    setPendingClientId(null);
  };

  return (
    <WorkspaceContext.Provider
      value={{
        activeUser,
        setActiveUser,
        logout,
        clients,
        setClients,
        activeClient,
        setActiveClient,
        isDirty,
        setIsDirty,
        switchClient,
        pendingClientId,
        confirmDiscardAndSwitch,
        cancelSwitch,
        refreshClients,
        isLoading,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
}
