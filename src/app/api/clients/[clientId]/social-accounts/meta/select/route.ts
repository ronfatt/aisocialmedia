import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { decryptToken } from "@/lib/security/crypto";
import { requirePermission } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const { clientId } = await params;
    const { user } = await requirePermission(clientId, "social_accounts:manage");

    const body = await req.json();
    const { selectedAccountId, platform } = body;

    if (!selectedAccountId) {
      return NextResponse.json({ error: "selectedAccountId is required." }, { status: 400 });
    }

    const sessionCookie = req.cookies.get("scc_meta_discovery")?.value;
    if (!sessionCookie) {
      return NextResponse.json(
        { error: "No active account discovery session found. Please re-authorize." },
        { status: 400 }
      );
    }

    let sessionData;
    try {
      const decrypted = decryptToken(sessionCookie);
      sessionData = JSON.parse(decrypted);
    } catch {
      return NextResponse.json({ error: "Discovery session corrupted." }, { status: 400 });
    }

    if (sessionData.clientId !== clientId) {
      return NextResponse.json({ error: "Session tenant mismatch." }, { status: 403 });
    }

    const targetAccount = (sessionData.accounts || []).find((acc: any) => acc.id === selectedAccountId);
    if (!targetAccount) {
      return NextResponse.json(
        { error: "Selected account not found in current authorization session." },
        { status: 404 }
      );
    }

    // ------------------------------------------------------------------------
    // SECTION 16: DUPLICATE ACCOUNT PROTECTION
    // If this Facebook Page or IG account already belongs to another client, block it!
    // ------------------------------------------------------------------------
    const existingConflict = await db.socialAccount.findFirst({
      where: {
        platformAccountId: selectedAccountId,
        connectionStatus: "CONNECTED",
        clientId: { not: clientId },
      },
      include: {
        client: {
          select: { name: true },
        },
      },
    });

    if (existingConflict) {
      return NextResponse.json(
        {
          error: "This social account is already connected to another client.",
          existingClientName: existingConflict.client.name,
          platformAccountId: selectedAccountId,
        },
        { status: 409 }
      );
    }

    // Resolve client company name for audit logging
    const client = await db.client.findUnique({
      where: { id: clientId },
      select: { name: true, organizationId: true },
    });

    const targetPlatform = platform || sessionData.platform || targetAccount.platform;

    // Check if a record already exists for this client & platform
    const existingForClient = await db.socialAccount.findFirst({
      where: {
        clientId,
        platform: targetPlatform,
      },
    });

    let savedAccount;
    if (existingForClient) {
      savedAccount = await db.socialAccount.update({
        where: { id: existingForClient.id },
        data: {
          platformAccountId: targetAccount.id,
          platformParentAccountId: targetAccount.parentAccountId || null,
          displayName: targetAccount.name,
          username: targetAccount.username || null,
          profileImageUrl: targetAccount.profilePictureUrl || null,
          connectionStatus: "CONNECTED",
          accountType: targetAccount.accountType || "PAGE",
          accessTokenEncrypted: targetAccount.accessTokenEncrypted,
          permissionsGranted: JSON.stringify(targetAccount.tasks || targetAccount.permissions || []),
          providerMetadata: JSON.stringify({ category: targetAccount.category }),
          connectedBy: user.name,
          connectedAt: new Date(),
          lastVerifiedAt: new Date(),
        },
      });
    } else {
      savedAccount = await db.socialAccount.create({
        data: {
          organizationId: client?.organizationId || user.organizationId,
          clientId,
          platform: targetPlatform,
          provider: "META",
          platformAccountId: targetAccount.id,
          platformParentAccountId: targetAccount.parentAccountId || null,
          displayName: targetAccount.name,
          username: targetAccount.username || null,
          profileImageUrl: targetAccount.profilePictureUrl || null,
          connectionStatus: "CONNECTED",
          accountType: targetAccount.accountType || "PAGE",
          accessTokenEncrypted: targetAccount.accessTokenEncrypted,
          permissionsGranted: JSON.stringify(targetAccount.tasks || targetAccount.permissions || []),
          providerMetadata: JSON.stringify({ category: targetAccount.category }),
          connectedBy: user.name,
          connectedAt: new Date(),
          lastVerifiedAt: new Date(),
        },
      });
    }

    // Activity Log
    await db.activityLog.create({
      data: {
        organizationId: client?.organizationId || user.organizationId,
        clientId,
        userId: user.id,
        action: sessionData.action === "RECONNECT" ? "SOCIAL_ACCOUNT_RECONNECTED" : "SOCIAL_ACCOUNT_CONNECTED",
        entityType: "SOCIAL_ACCOUNT",
        entityId: savedAccount.id,
        description: `Connected ${targetPlatform} account "${targetAccount.name}" to client "${client?.name}" by ${user.name}.`,
      },
    });

    // Clear the discovery session cookie after successful connection
    const res = NextResponse.json({
      success: true,
      account: {
        id: savedAccount.id,
        platform: savedAccount.platform,
        displayName: savedAccount.displayName,
        username: savedAccount.username,
        profileImageUrl: savedAccount.profileImageUrl,
        connectionStatus: savedAccount.connectionStatus,
        lastVerifiedAt: savedAccount.lastVerifiedAt,
      },
    });

    res.cookies.delete("scc_meta_discovery");
    return res;
  } catch (error: any) {
    const status = error.message?.startsWith("403") ? 403 : error.message?.startsWith("401") ? 401 : 500;
    return NextResponse.json({ error: error.message || "Failed to connect selected account" }, { status });
  }
}
