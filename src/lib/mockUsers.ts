import { AuthenticatedUser } from "@/types";

export const MOCK_USERS: AuthenticatedUser[] = [
  {
    id: "admin-sarah",
    name: "Sarah Chen",
    email: "sarah.chen@apexmedia.io",
    role: "ADMIN",
    organizationId: "org-apex",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&crop=face",
  },
  {
    id: "manager-marcus",
    name: "Marcus Wong",
    email: "marcus.wong@apexmedia.io",
    role: "ACCOUNT_MANAGER",
    organizationId: "org-apex",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=face",
  },
  {
    id: "manager-aisha",
    name: "Aisha Rahman",
    email: "aisha.rahman@apexmedia.io",
    role: "ACCOUNT_MANAGER",
    organizationId: "org-apex",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&crop=face",
  },
];
