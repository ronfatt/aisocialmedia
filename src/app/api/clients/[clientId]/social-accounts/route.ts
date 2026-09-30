import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { MetaProvider } from "@/lib/social/MetaProvider";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const { clientId } = await params;
    await requirePermission(clientId, "social_accounts:view");

    const accounts = await db.socialAccount.findMany({
      where: { clientId },
      select: {
        id: true,
        platform: true,
        displayName: true,
        username: true,
        profileImageUrl: true,
        platformAccountId: true,
        platformParentAccountId: true,
        connectionStatus: true,
        accountType: true,
        isPrimary: true,
        permissionsGranted: true,
        providerMetadata: true,
        connectedBy: true,
        connectedAt: true,
        lastVerifiedAt: true,
        createdAt: true,
        updatedAt: true,
        // STRICT SECURITY: accessTokenEncrypted and refreshTokenEncrypted are NEVER selected or leaked
      },
    });

    const isMetaConfigured = MetaProvider.isConfigured();

    const platforms = ["FACEBOOK", "INSTAGRAM", "TIKTOK"] as const;
    const result = platforms.map((p) => {
      const found = accounts.find((a) => a.platform === p);
      return {
        id: found?.id || `stub-${p.toLowerCase()}`,
        platform: p,
        displayName: found?.displayName || (p === "FACEBOOK" ? "Facebook Page" : p === "INSTAGRAM" ? "Instagram Professional" : "TikTok for Business"),
        username: found?.username || null,
        profileImageUrl: found?.profileImageUrl || null,
        platformAccountId: found?.platformAccountId || null,
        connectionStatus: found?.connectionStatus || "NOT_CONNECTED",
        accountType: found?.accountType || (p === "FACEBOOK" ? "PAGE" : p === "INSTAGRAM" ? "BUSINESS" : "BUSINESS"),
        permissionsGranted: found?.permissionsGranted ? JSON.parse(found.permissionsGranted) : [],
        connectedBy: found?.connectedBy || null,
        connectedAt: found?.connectedAt || null,
        lastVerifiedAt: found?.lastVerifiedAt || null,
        isConfigured: p === "TIKTOK" ? false : isMetaConfigured,
      };
    });

    return NextResponse.json({ accounts: result, isMetaConfigured });
  } catch (error: any) {
    const status = error.message?.startsWith("403") ? 403 : error.message?.startsWith("401") ? 401 : 500;
    return NextResponse.json({ error: error.message || "Failed to fetch social accounts" }, { status });
  }
}
