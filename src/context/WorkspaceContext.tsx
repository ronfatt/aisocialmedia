"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AuthenticatedUser, ClientListItem } from "@/types";

interface WorkspaceContextType {
  activeUser: AuthenticatedUser;
  setActiveUser: (user: AuthenticatedUser) => void;
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
  initialUser: AuthenticatedUser;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [activeUser, setActiveUserState] = useState<AuthenticatedUser>(initialUser);
  const [clients, setClients] = useState<ClientListItem[]>([]);
  const [activeClient, setActiveClient] = useState<ClientListItem | null>(null);
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [pendingClientId, setPendingClientId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Sync user in cookie for SSR consistency
  const setActiveUser = (user: AuthenticatedUser) => {
    setActiveUserState(user);
    document.cookie = `scc_active_user=${user.email}; path=/; max-age=86400`;
    router.refresh();
  };

  const refreshClients = async () => {
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
  }, [activeUser.email]);

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
      // At the agency level
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
    const target = clients.find((c) => c.id === clientId || c.slug === clientId);
    if (target) {
      setActiveClient(target);
      router.push(`/clients/${target.id}/overview`);
    } else {
      router.push(`/clients/${clientId}/overview`);
    }
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
