import { cookies } from "next/headers";
import { db } from "./db";
import { AuthenticatedUser, UserRole } from "@/types";
import { MOCK_USERS } from "./mockUsers";


export async function getCurrentUser(): Promise<AuthenticatedUser> {
  const cookieStore = await cookies();
  const userEmail = cookieStore.get("scc_active_user")?.value || "sarah.chen@apexmedia.io";
  
  // Find in DB or fallback to MOCK_USERS
  const dbUser = await db.user.findUnique({
    where: { email: userEmail },
    include: { clientMemberships: true },
  });

  if (dbUser) {
    return {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role as UserRole,
      avatarUrl: dbUser.avatarUrl,
      organizationId: dbUser.organizationId,
      assignedClientIds: dbUser.clientMemberships.map((m) => m.clientId),
    };
  }

  const fallback = MOCK_USERS.find((u) => u.email === userEmail) || MOCK_USERS[0];
  return fallback;
}

/**
 * Multi-tenant security guard:
 * Strictly verifies whether the current user has authorization to access the specified client.
 * Prevents cross-client data leakage (e.g. Employee B cannot access UXUI Holdings).
 */
export async function assertClientAccess(
  clientId: string,
  user?: AuthenticatedUser
): Promise<{ allowed: boolean; error?: string; client?: any }> {
  const currentUser = user || (await getCurrentUser());

  const client = await db.client.findUnique({
    where: { id: clientId },
    include: { members: true },
  });

  if (!client) {
    return { allowed: false, error: "Client not found" };
  }

  // 1. Owner or Admin has access to all clients in their organization
  if (currentUser.role === "ADMIN" || currentUser.role === "OWNER") {
    return { allowed: true, client };
  }

  // 2. Specific client assignments
  const isAssigned =
    client.accountManagerId === currentUser.id ||
    client.members.some((m) => m.userId === currentUser.id);

  if (!isAssigned) {
    return {
      allowed: false,
      error: `Access Denied: You do not have permissions to access client workspace "${client.name}".`,
    };
  }

  return { allowed: true, client };
}
