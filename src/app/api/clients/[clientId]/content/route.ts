import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const { clientId } = await params;
    await requirePermission(clientId, "content:view");

    const items = await db.contentItem.findMany({
      where: { clientId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ items });
  } catch (error: any) {
    const status = error.message?.startsWith("403") ? 403 : error.message?.startsWith("401") ? 401 : 500;
    return NextResponse.json({ error: error.message || "Failed to fetch content" }, { status });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const { clientId } = await params;
    const { user } = await requirePermission(clientId, "content:create");

    const body = await req.json();
    const { title, description, contentPillar, campaignId, platforms = ["FACEBOOK"], internalNotes, scheduledFor, status = "DRAFT" } = body;

    if (!title || title.trim() === "") {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const newItem = await db.contentItem.create({
      data: {
        clientId,
        campaignId: campaignId || null,
        title,
        description: description || "",
        contentPillar: contentPillar || null,
        platforms: JSON.stringify(platforms),
        internalNotes: internalNotes || null,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
        status,
        createdBy: user.name,
      },
    });

    await db.activityLog.create({
      data: {
        organizationId: user.organizationId,
        clientId,
        userId: user.id,
        action: "CONTENT_CREATED",
        entityType: "CONTENT",
        entityId: newItem.id,
        description: `Created content item "${newItem.title}" by ${user.name}.`,
      },
    });

    return NextResponse.json({ success: true, item: newItem }, { status: 201 });
  } catch (error: any) {
    const status = error.message?.startsWith("403") ? 403 : error.message?.startsWith("401") ? 401 : 500;
    return NextResponse.json({ error: error.message || "Failed to create content" }, { status });
  }
}
