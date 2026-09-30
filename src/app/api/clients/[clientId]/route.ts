import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { assertClientAccess } from "@/lib/auth";

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

    const client = await db.client.findUnique({
      where: { id: clientId },
      include: {
        profile: true,
        socialAccounts: true,
        strategy: {
          include: {
            pillars: {
              orderBy: { orderIndex: "asc" },
            },
          },
        },
        targetMarket: true,
        contentItems: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        activityLogs: {
          orderBy: { createdAt: "desc" },
          take: 10,
          include: {
            user: {
              select: { name: true, avatarUrl: true },
            },
          },
        },
      },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Calculate Summary Stats accurately across all client items
    const allClientItems = await db.contentItem.findMany({
      where: { clientId },
      select: { status: true, platforms: true, scheduledFor: true },
    });

    const contentStats = {
      drafts: allClientItems.filter((i) => i.status === "DRAFT").length,
      pendingApproval: allClientItems.filter((i) => i.status === "PENDING_APPROVAL" || i.status === "READY_FOR_REVIEW").length,
      changesRequested: allClientItems.filter((i) => i.status === "CHANGES_REQUESTED").length,
      approved: allClientItems.filter((i) => i.status === "APPROVED" || i.status === "READY_TO_SCHEDULE").length,
      scheduled: allClientItems.filter((i) => i.status === "SCHEDULED").length,
      published: allClientItems.filter((i) => i.status === "PUBLISHED").length,
    };

    // Calculate This Week Scheduled Posts
    const scheduledThisWeek = allClientItems.filter((i) => i.status === "SCHEDULED").length;

    // Platform Distribution
    const platformDistribution = {
      Facebook: allClientItems.filter((i) => i.platforms.includes("FACEBOOK")).length,
      Instagram: allClientItems.filter((i) => i.platforms.includes("INSTAGRAM")).length,
      TikTok: allClientItems.filter((i) => i.platforms.includes("TIKTOK")).length,
    };

    return NextResponse.json({
      client,
      contentStats,
      scheduledThisWeek,
      platformDistribution,
    });
  } catch (error) {
    console.error("GET /api/clients/[clientId] error:", error);
    return NextResponse.json({ error: "Failed to fetch client workspace" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const { clientId } = await params;
    const auth = await assertClientAccess(clientId);
    if (!auth.allowed) {
      return NextResponse.json({ error: auth.error }, { status: 403 });
    }

    const body = await req.json();
    const updated = await db.client.update({
      where: { id: clientId },
      data: {
        status: body.status,
        name: body.name,
        brandName: body.brandName,
        industry: body.industry,
        locationCity: body.locationCity,
        locationState: body.locationState,
      },
    });

    return NextResponse.json({ success: true, client: updated });
  } catch (error) {
    console.error("PATCH /api/clients/[clientId] error:", error);
    return NextResponse.json({ error: "Failed to update client" }, { status: 500 });
  }
}
