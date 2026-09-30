import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "./db";
import { AuthenticatedUser, UserRole } from "@/types";
import { hasPermission, Permission } from "./permissions";
import { MOCK_USERS } from "./mockUsers";

export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  const cookieStore = await cookies();
  const userEmail = cookieStore.get("scc_active_user")?.value;

  if (!userEmail) {
    return null;
  }

  // Find in DB
  const dbUser = await db.user.findUnique({
    where: { email: userEmail },
    include: {
      clientMemberships: true,
      orgMemberships: true,
    },
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

  // Fallback to MOCK_USERS if DB was wiped or email matches mock
  const fallback = MOCK_USERS.find((u) => u.email === userEmail);
  return fallback || null;
}

/**
 * Server-side requirement: User must be authenticated.
 * If not authenticated, redirects to /login.
 */
export async function requireUser(): Promise<AuthenticatedUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

/**
 * Server-side requirement: User must belong to organization.
 */
export async function requireOrganizationAccess(
  orgId: string,
  user?: AuthenticatedUser
): Promise<AuthenticatedUser> {
  const currentUser = user || (await requireUser());
  if (currentUser.organizationId !== orgId) {
    throw new Error("403: Forbidden - You do not belong to this organization.");
  }
  return currentUser;
}

/**
 * Server-side requirement: User must have access to the specified client.
 * Strictly avoids leaking client existence if unauthorized.
 */
export async function requireClientAccess(
  clientId: string,
  user?: AuthenticatedUser
): Promise<{ user: AuthenticatedUser; client: any }> {
  const currentUser = user || (await requireUser());

  const client = await db.client.findUnique({
    where: { id: clientId },
    include: { members: true },
  });

  if (!client || client.organizationId !== currentUser.organizationId) {
    throw new Error("403: Forbidden - Access denied to client workspace.");
  }

  // Owners and Admins have access to all clients in their organization
  if (currentUser.role === "OWNER" || currentUser.role === "ADMIN") {
    return { user: currentUser, client };
  }

  // Client-level membership check
  const isAssigned =
    client.accountManagerId === currentUser.id ||
    client.members.some((m) => m.userId === currentUser.id);

  if (!isAssigned) {
    throw new Error("403: Forbidden - Access denied to client workspace.");
  }

  return { user: currentUser, client };
}

/**
 * Server-side requirement: User must have a specific permission for the client workspace.
 */
export async function requirePermission(
  clientId: string,
  permission: Permission,
  user?: AuthenticatedUser
): Promise<{ user: AuthenticatedUser; client: any }> {
  const { user: currentUser, client } = await requireClientAccess(clientId, user);

  // Check if user has membership-specific role override
  const memberRecord = client.members?.find((m: any) => m.userId === currentUser.id);
  const effectiveRole = (memberRecord?.role as UserRole) || currentUser.role;

  if (!hasPermission(effectiveRole, permission)) {
    throw new Error(`403: Forbidden - Role '${effectiveRole}' lacks permission '${permission}'.`);
  }

  return { user: currentUser, client };
}

/**
 * Non-throwing access checker for route handlers.
 */
export async function assertClientAccess(
  clientId: string,
  user?: AuthenticatedUser | null
): Promise<{ allowed: boolean; error?: string; client?: any; user?: AuthenticatedUser }> {
  const currentUser = user !== undefined ? user : await getCurrentUser();

  if (!currentUser) {
    return { allowed: false, error: "401: Unauthorized - Please log in." };
  }

  const client = await db.client.findUnique({
    where: { id: clientId },
    include: { members: true },
  });

  if (!client || client.organizationId !== currentUser.organizationId) {
    return { allowed: false, error: "403: Access Denied - Inaccessible client workspace." };
  }

  if (currentUser.role === "OWNER" || currentUser.role === "ADMIN") {
    return { allowed: true, client, user: currentUser };
  }

  const isAssigned =
    client.accountManagerId === currentUser.id ||
    client.members.some((m) => m.userId === currentUser.id);

  if (!isAssigned) {
    return {
      allowed: false,
      error: `403: Access Denied - You are not authorized for client workspace "${client.name}".`,
    };
  }

  return { allowed: true, client, user: currentUser };
}
