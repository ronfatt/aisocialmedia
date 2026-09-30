import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ clientId: string; accountId: string }> }
) {
  try {
    const { clientId, accountId } = await params;
    const { user } = await requirePermission(clientId, "social_accounts:manage");

    const account = await db.socialAccount.findFirst({
      where: { id: accountId, clientId },
      include: {
        client: {
          select: { name: true, organizationId: true },
        },
      },
    });

    if (!account) {
      return NextResponse.json({ error: "Social account not found for this client." }, { status: 404 });
    }

    // Safely disconnect: revoke access locally, invalidate tokens, keep historical logs
    await db.socialAccount.update({
      where: { id: account.id },
      data: {
        connectionStatus: "DISCONNECTED",
        accessTokenEncrypted: null,
        refreshTokenEncrypted: null,
        tokenExpiresAt: null,
      },
    });

    // Activity Log
    await db.activityLog.create({
      data: {
        organizationId: account.client.organizationId || user.organizationId,
        clientId,
        userId: user.id,
        action: "SOCIAL_ACCOUNT_DISCONNECTED",
        entityType: "SOCIAL_ACCOUNT",
        entityId: account.id,
        description: `Disconnected ${account.platform} account "${account.displayName}" from client "${account.client.name}" by ${user.name}.`,
      },
    });

    return NextResponse.json({
      success: true,
      message: `${account.platform} account "${account.displayName}" was successfully disconnected.`,
    });
  } catch (error: any) {
    const status = error.message?.startsWith("403") ? 403 : error.message?.startsWith("401") ? 401 : 500;
    return NextResponse.json({ error: error.message || "Failed to disconnect account" }, { status });
  }
}
