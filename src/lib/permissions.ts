import { UserRole } from "@/types";

export type Permission =
  | "org:manage_settings"
  | "org:manage_users"
  | "org:manage_clients"
  | "client:view"
  | "client:edit_profile"
  | "client:edit_strategy"
  | "client:delete"
  | "content:view"
  | "content:create"
  | "content:edit"
  | "content:approve"
  | "content:delete"
  | "media:view"
  | "media:upload"
  | "media:delete"
  | "leads:view"
  | "social_accounts:view"
  | "social_accounts:manage"
  | "settings:manage";

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  OWNER: [
    "org:manage_settings",
    "org:manage_users",
    "org:manage_clients",
    "client:view",
    "client:edit_profile",
    "client:edit_strategy",
    "client:delete",
    "content:view",
    "content:create",
    "content:edit",
    "content:approve",
    "content:delete",
    "media:view",
    "media:upload",
    "media:delete",
    "leads:view",
    "social_accounts:view",
    "social_accounts:manage",
    "settings:manage",
  ],
  ADMIN: [
    "org:manage_clients",
    "org:manage_users",
    "client:view",
    "client:edit_profile",
    "client:edit_strategy",
    "content:view",
    "content:create",
    "content:edit",
    "content:approve",
    "content:delete",
    "media:view",
    "media:upload",
    "media:delete",
    "leads:view",
    "social_accounts:view",
    "social_accounts:manage",
    "settings:manage",
  ],
  ACCOUNT_MANAGER: [
    "client:view",
    "client:edit_profile",
    "client:edit_strategy",
    "content:view",
    "content:create",
    "content:edit",
    "content:delete",
    "media:view",
    "media:upload",
    "media:delete",
    "leads:view",
    "social_accounts:view",
    "social_accounts:manage",
  ],
  CONTENT_CREATOR: [
    "client:view",
    "content:view",
    "content:create",
    "content:edit",
    "media:view",
    "media:upload",
    "social_accounts:view",
  ],
  APPROVER: [
    "client:view",
    "content:view",
    "content:approve",
    "media:view",
    "social_accounts:view",
  ],
  SALES: [
    "client:view",
    "leads:view",
    "social_accounts:view",
  ],
  VIEWER: [
    "client:view",
    "content:view",
    "media:view",
    "social_accounts:view",
  ],
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  const allowed = ROLE_PERMISSIONS[role] || [];
  return allowed.includes(permission);
}

export function getAllowedPermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}
