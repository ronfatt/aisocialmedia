import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { MetaProvider } from "@/lib/social/MetaProvider";
import { MetaPlatformType } from "@/lib/social/types";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const { clientId } = await params;
    const { user } = await requirePermission(clientId, "social_accounts:manage");

    const url = new URL(req.url);
    const platformParam = (url.searchParams.get("platform") || "FACEBOOK").toUpperCase();
    const actionParam = (url.searchParams.get("action") || "CONNECT").toUpperCase() as "CONNECT" | "RECONNECT";
    const socialAccountId = url.searchParams.get("socialAccountId") || undefined;

    if (platformParam !== "FACEBOOK" && platformParam !== "INSTAGRAM") {
      return NextResponse.json({ error: "Platform must be FACEBOOK or INSTAGRAM" }, { status: 400 });
    }

    const platform = platformParam as MetaPlatformType;

    if (!MetaProvider.isConfigured()) {
      return NextResponse.json(
        {
          error: "Meta Integration Not Configured",
          message: "Please configure META_APP_ID and META_APP_SECRET in your server environment.",
        },
        { status: 503 }
      );
    }

    const initResult = MetaProvider.beginConnection({
      userId: user.id,
      organizationId: user.organizationId,
      clientId,
      platform,
      action: actionParam,
      socialAccountId,
    });

    // Record audit event
    await db.activityLog.create({
      data: {
        organizationId: user.organizationId,
        clientId,
        userId: user.id,
        action: "SOCIAL_CONNECTION_STARTED",
        entityType: "SOCIAL_ACCOUNT",
        description: `Initiated ${platform} OAuth authorization for client workspace by ${user.name}.`,
      },
    });

    return NextResponse.json({
      authUrl: initResult.authUrl,
      state: initResult.state,
      platform,
    });
  } catch (error: any) {
    const status = error.message?.startsWith("403") ? 403 : error.message?.startsWith("401") ? 401 : 500;
    return NextResponse.json({ error: error.message || "Failed to initiate Meta connection" }, { status });
  }
}
