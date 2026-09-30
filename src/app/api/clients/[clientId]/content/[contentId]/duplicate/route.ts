import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ clientId: string; contentId: string }> }
) {
  try {
    const { clientId, contentId } = await params;
    const { user } = await requirePermission(clientId, "content:create");

    const source = await db.contentItem.findUnique({
      where: { id: contentId },
      include: { variants: true },
    });

    if (!source || source.clientId !== clientId) {
      return NextResponse.json({ error: "Source content item not found" }, { status: 404 });
    }

    const duplicatedItem = await db.contentItem.create({
      data: {
        organizationId: user.organizationId,
        clientId,
        campaignId: source.campaignId,
        contentPillarId: source.contentPillarId,
        title: `${source.title} (Copy)`,
        description: source.description,
        coreMessage: source.coreMessage,
        internalBrief: source.internalBrief,
        objective: source.objective,
        contentPillar: source.contentPillar,
        contentType: source.contentType,
        status: "DRAFT",
        targetAudience: source.targetAudience,
        targetLocation: source.targetLocation,
        callToAction: source.callToAction,
        productsServices: source.productsServices,
        platforms: source.platforms,
        mediaUrls: source.mediaUrls,
        internalNotes: source.internalNotes,
        createdBy: user.name,
      },
    });

    for (const v of source.variants) {
      await db.postVariant.create({
        data: {
          organizationId: user.organizationId,
          clientId,
          contentItemId: duplicatedItem.id,
          platform: v.platform,
          headline: v.headline,
          hook: v.hook,
          caption: v.caption,
          cta: v.cta,
          hashtags: v.hashtags,
          onScreenText: v.onScreenText,
          videoIdea: v.videoIdea,
          platformNotes: v.platformNotes,
          mediaSelection: v.mediaSelection,
          language: v.language,
          generationStatus: v.generationStatus,
          approvalStatus: "PENDING",
          isEditedManually: v.isEditedManually,
        },
      });
    }

    await db.activityLog.create({
      data: {
        organizationId: user.organizationId,
        clientId,
        userId: user.id,
        action: "CONTENT_DUPLICATED",
        entityType: "CONTENT",
        entityId: duplicatedItem.id,
        description: `Duplicated content item "${source.title}" as "${duplicatedItem.title}" by ${user.name}.`,
      },
    });

    return NextResponse.json({ success: true, item: duplicatedItem }, { status: 201 });
  } catch (error: any) {
    const status = error.message?.startsWith("403") ? 403 : error.message?.startsWith("401") ? 401 : 500;
    return NextResponse.json({ error: error.message || "Failed to duplicate content" }, { status });
  }
}
