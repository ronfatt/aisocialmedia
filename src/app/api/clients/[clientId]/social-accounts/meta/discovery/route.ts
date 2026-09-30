import { NextRequest, NextResponse } from "next/server";
import { decryptToken } from "@/lib/security/crypto";
import { requirePermission } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const { clientId } = await params;
    await requirePermission(clientId, "social_accounts:manage");

    const sessionCookie = req.cookies.get("scc_meta_discovery")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: "No active account discovery session found." }, { status: 404 });
    }

    let sessionData;
    try {
      const decrypted = decryptToken(sessionCookie);
      sessionData = JSON.parse(decrypted);
    } catch {
      return NextResponse.json({ error: "Discovery session corrupted or invalid." }, { status: 400 });
    }

    // Verify tenant binding: Session must belong to this specific client!
    if (sessionData.clientId !== clientId) {
      return NextResponse.json(
        { error: "Discovery session tenant mismatch. Access denied." },
        { status: 403 }
      );
    }

    // Return sanitized accounts (tokens are never returned to frontend)
    const sanitizedAccounts = (sessionData.accounts || []).map((acc: any) => ({
      id: acc.id,
      parentAccountId: acc.parentAccountId,
      name: acc.name,
      username: acc.username,
      profilePictureUrl: acc.profilePictureUrl,
      category: acc.category,
      accountType: acc.accountType,
      platform: acc.platform,
    }));

    return NextResponse.json({
      platform: sessionData.platform,
      action: sessionData.action || "CONNECT",
      accounts: sanitizedAccounts,
      count: sanitizedAccounts.length,
    });
  } catch (error: any) {
    const status = error.message?.startsWith("403") ? 403 : error.message?.startsWith("401") ? 401 : 500;
    return NextResponse.json({ error: error.message || "Failed to fetch discovered accounts" }, { status });
  }
}
