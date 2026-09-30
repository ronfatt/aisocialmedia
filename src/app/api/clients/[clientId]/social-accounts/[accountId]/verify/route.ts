import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { decryptToken } from "@/lib/security/crypto";
import { MetaProvider } from "@/lib/social/MetaProvider";
import { MetaPlatformType } from "@/lib/social/types";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ clientId: string; accountId: string }> }
) {
  try {
    const { clientId, accountId } = await params;
    await requirePermission(clientId, "social_accounts:view");

    const account = await db.socialAccount.findFirst({
      where: { id: accountId, clientId },
    });

    if (!account) {
      return NextResponse.json({ error: "Social account not found for this client." }, { status: 404 });
    }

    if (!account.accessTokenEncrypted || !account.platformAccountId) {
      return NextResponse.json({
        result: {
          healthy: false,
          status: "NOT_CONNECTED",
          message: "No credentials stored for this account. Please connect first.",
          lastVerifiedAt: new Date(),
        },
      });
    }

    // Decrypt token server-side for verification
    let decryptedToken = "";
    try {
      decryptedToken = decryptToken(account.accessTokenEncrypted);
    } catch {
      return NextResponse.json({
        result: {
          healthy: false,
          status: "ERROR",
          message: "Stored credential decryption error. Re-authentication required.",
          lastVerifiedAt: new Date(),
        },
      });
    }

    const verificationResult = await MetaProvider.verifyConnection(
      decryptedToken,
      account.platformAccountId,
      account.platform as MetaPlatformType
    );

    // Update database status and verification timestamp
    await db.socialAccount.update({
      where: { id: account.id },
      data: {
        connectionStatus: verificationResult.status,
        lastVerifiedAt: verificationResult.lastVerifiedAt,
      },
    });

    return NextResponse.json({
      result: {
        healthy: verificationResult.healthy,
        status: verificationResult.status,
        message: verificationResult.message,
        accountName: account.displayName,
        username: account.username,
        permissionsSummary: verificationResult.permissionsSummary || {
          pageAccess: true,
          publishing: false,
          insights: false,
        },
        lastVerifiedAt: verificationResult.lastVerifiedAt,
      },
    });
  } catch (error: any) {
    const status = error.message?.startsWith("403") ? 403 : error.message?.startsWith("401") ? 401 : 500;
    return NextResponse.json({ error: error.message || "Failed to verify connection" }, { status });
  }
}
