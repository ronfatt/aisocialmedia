import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { assertClientAccess, requireUser } from "@/lib/auth";
import { socialProviders } from "@/lib/social";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const { clientId } = await params;
    const auth = await assertClientAccess(clientId);
    if (!auth.allowed) {
      return NextResponse.json({ error: auth.error }, { status: 403 });
    }

    const accounts = await db.socialAccount.findMany({
      where: { clientId },
      select: {
        id: true,
        platform: true,
        displayName: true,
        connectionStatus: true,
        tokenExpiry: true,
        updatedAt: true,
        // Notice: accessTokenEncrypted and refreshTokenEncrypted are strictly omitted!
      },
    });

    const platforms = ["FACEBOOK", "INSTAGRAM", "TIKTOK"] as const;
    const result = platforms.map((p) => {
      const found = accounts.find((a) => a.platform === p);
      const provider = socialProviders[p];
      return {
        platform: p,
        displayName: found?.displayName || provider.displayName,
        connectionStatus: found?.connectionStatus || "PENDING_INTEGRATION",
        requiredScopes: provider.requiredScopes,
        updatedAt: found?.updatedAt || null,
      };
    });

    return NextResponse.json({ accounts: result });
  } catch (error) {
    console.error("GET /api/clients/[clientId]/social-accounts error:", error);
    return NextResponse.json({ error: "Failed to fetch social accounts" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const { clientId } = await params;
    const auth = await assertClientAccess(clientId);
    if (!auth.allowed) {
      return NextResponse.json({ error: auth.error }, { status: 403 });
    }

    const user = await requireUser();
    const body = await req.json();
    const { platform, action, accountName } = body; // action: "toggle" or "disconnect"

    const existing = await db.socialAccount.findUnique({
      where: {
        clientId_platform: {
          clientId,
          platform,
        },
      },
    });

    let newStatus = "CONNECTED";
    if (existing?.connectionStatus === "CONNECTED") {
      newStatus = "PENDING_INTEGRATION";
    }

    const updated = await db.socialAccount.upsert({
      where: {
        clientId_platform: {
          clientId,
          platform,
        },
      },
      update: {
        connectionStatus: newStatus,
        displayName: newStatus === "CONNECTED" ? accountName || `${platform} Connected Channel` : "",
      },
      create: {
        clientId,
        platform,
        connectionStatus: newStatus,
        displayName: accountName || `${platform} Connected Channel`,
      },
    });

    await db.activityLog.create({
      data: {
        clientId,
        userId: user.id,
        action: newStatus === "CONNECTED" ? "SOCIAL_ACCOUNT_CONNECTED" : "SOCIAL_ACCOUNT_DISCONNECTED",
        description: `${platform} connection status updated to ${newStatus} by ${user.name}.`,
      },
    });

    return NextResponse.json({
      success: true,
      account: {
        platform: updated.platform,
        displayName: updated.displayName,
        connectionStatus: updated.connectionStatus,
      },
    });
  } catch (error) {
    console.error("POST /api/clients/[clientId]/social-accounts error:", error);
    return NextResponse.json({ error: "Failed to update social account" }, { status: 500 });
  }
}
