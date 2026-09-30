import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ clientId: string; contentId: string }> }
) {
  try {
    const { clientId, contentId } = await params;
    await requirePermission(clientId, "content:view");

    const item = await db.contentItem.findUnique({
      where: { id: contentId },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            industry: true,
            status: true,
          },
        },
        campaign: true,
        contentPillarRel: true,
        variants: {
          orderBy: { platform: "asc" },
        },
        versions: {
          orderBy: { versionNumber: "desc" },
          take: 10,
        },
        approvalRequests: {
          include: {
            comments: {
              orderBy: { createdAt: "asc" },
            },
          },
          orderBy: { submittedAt: "desc" },
        },
        aiLogs: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });

    if (!item || item.clientId !== clientId) {
      return NextResponse.json({ error: "Content item not found" }, { status: 404 });
    }

    return NextResponse.json({ item });
  } catch (error: any) {
    const status = error.message?.startsWith("403") ? 403 : error.message?.startsWith("401") ? 401 : 500;
    return NextResponse.json({ error: error.message || "Failed to fetch content item" }, { status });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ clientId: string; contentId: string }> }
) {
  try {
    const { clientId, contentId } = await params;
    const { user } = await requirePermission(clientId, "content:edit");

    const existing = await db.contentItem.findUnique({
      where: { id: contentId },
      include: { variants: true },
    });

    if (!existing || existing.clientId !== clientId) {
      return NextResponse.json({ error: "Content item not found" }, { status: 404 });
    }

    const body = await req.json();
    const {
      title,
      description,
      coreMessage,
      internalBrief,
      objective,
      contentType,
      campaignId,
      contentPillarId,
      contentPillar,
      targetAudience,
      targetLocation,
      callToAction,
      productsServices,
      platforms,
      mediaUrls,
      internalNotes,
      scheduledFor,
      status,
      assignedTo,
      variants, // optional array of variant updates: [{ id?, platform, headline, hook, caption, cta, hashtags, onScreenText, videoIdea, isEditedManually }]
      changeSummary,
    } = body;

    // 1. Update Master Item
    const updatedItem = await db.contentItem.update({
      where: { id: contentId },
      data: {
        title: title !== undefined ? title : existing.title,
        description: description !== undefined ? description : (coreMessage || existing.description),
        coreMessage: coreMessage !== undefined ? coreMessage : existing.coreMessage,
        internalBrief: internalBrief !== undefined ? internalBrief : existing.internalBrief,
        objective: objective !== undefined ? objective : existing.objective,
        contentType: contentType !== undefined ? contentType : existing.contentType,
        campaignId: campaignId !== undefined ? (campaignId || null) : existing.campaignId,
        contentPillarId: contentPillarId !== undefined ? (contentPillarId || null) : existing.contentPillarId,
        contentPillar: contentPillar !== undefined ? contentPillar : existing.contentPillar,
        targetAudience: targetAudience !== undefined ? targetAudience : existing.targetAudience,
        targetLocation: targetLocation !== undefined ? targetLocation : existing.targetLocation,
        callToAction: callToAction !== undefined ? callToAction : existing.callToAction,
        productsServices: productsServices !== undefined ? productsServices : existing.productsServices,
        platforms: platforms !== undefined ? (Array.isArray(platforms) ? JSON.stringify(platforms) : platforms) : existing.platforms,
        mediaUrls: mediaUrls !== undefined ? (Array.isArray(mediaUrls) ? JSON.stringify(mediaUrls) : mediaUrls) : existing.mediaUrls,
        internalNotes: internalNotes !== undefined ? internalNotes : existing.internalNotes,
        scheduledFor: scheduledFor !== undefined ? (scheduledFor ? new Date(scheduledFor) : null) : existing.scheduledFor,
        assignedTo: assignedTo !== undefined ? assignedTo : existing.assignedTo,
        status: status !== undefined ? status : existing.status,
      },
    });

    // 2. Update or upsert variants if provided
    let updatedVariants = [];
    if (Array.isArray(variants)) {
      for (const v of variants) {
        if (v.id) {
          const uv = await db.postVariant.update({
            where: { id: v.id },
            data: {
              headline: v.headline !== undefined ? v.headline : undefined,
              hook: v.hook !== undefined ? v.hook : undefined,
              caption: v.caption !== undefined ? v.caption : undefined,
              cta: v.cta !== undefined ? v.cta : undefined,
              hashtags: v.hashtags !== undefined ? v.hashtags : undefined,
              onScreenText: v.onScreenText !== undefined ? v.onScreenText : undefined,
              videoIdea: v.videoIdea !== undefined ? v.videoIdea : undefined,
              platformNotes: v.platformNotes !== undefined ? v.platformNotes : undefined,
              mediaSelection: v.mediaSelection !== undefined ? (Array.isArray(v.mediaSelection) ? JSON.stringify(v.mediaSelection) : v.mediaSelection) : undefined,
              language: v.language !== undefined ? v.language : undefined,
              generationStatus: v.generationStatus !== undefined ? v.generationStatus : undefined,
              approvalStatus: v.approvalStatus !== undefined ? v.approvalStatus : undefined,
              isEditedManually: v.isEditedManually !== undefined ? Boolean(v.isEditedManually) : true,
              versionNumber: { increment: 1 },
            },
          });
          updatedVariants.push(uv);
        } else if (v.platform) {
          // Check if variant for this platform exists
          const existingVar = existing.variants.find((ev) => ev.platform === v.platform);
          if (existingVar) {
            const uv = await db.postVariant.update({
              where: { id: existingVar.id },
              data: {
                headline: v.headline,
                hook: v.hook,
                caption: v.caption,
                cta: v.cta,
                hashtags: v.hashtags,
                onScreenText: v.onScreenText,
                videoIdea: v.videoIdea,
                language: v.language || existingVar.language,
                generationStatus: v.generationStatus || "GENERATED",
                isEditedManually: v.isEditedManually !== undefined ? Boolean(v.isEditedManually) : true,
                versionNumber: { increment: 1 },
              },
            });
            updatedVariants.push(uv);
          } else {
            const nv = await db.postVariant.create({
              data: {
                organizationId: user.organizationId,
                clientId,
                contentItemId: contentId,
                platform: v.platform,
                headline: v.headline || null,
                hook: v.hook || null,
                caption: v.caption || "",
                cta: v.cta || null,
                hashtags: v.hashtags || null,
                onScreenText: v.onScreenText || null,
                videoIdea: v.videoIdea || null,
                language: v.language || "English",
                generationStatus: "GENERATED",
                approvalStatus: "PENDING",
                isEditedManually: Boolean(v.isEditedManually),
              },
            });
            updatedVariants.push(nv);
          }
        }
      }
    } else {
      updatedVariants = await db.postVariant.findMany({
        where: { contentItemId: contentId },
        orderBy: { platform: "asc" },
      });
    }

    // 3. Create version snapshot
    const versionCount = await db.contentVersion.count({ where: { contentItemId: contentId } });
    await db.contentVersion.create({
      data: {
        organizationId: user.organizationId,
        clientId,
        contentItemId: contentId,
        versionNumber: versionCount + 1,
        contentSnapshot: JSON.stringify({
          master: updatedItem,
          variants: updatedVariants,
        }),
        changeSummary: changeSummary || `Content item updated by ${user.name}`,
        createdBy: user.name,
      },
    });

    await db.activityLog.create({
      data: {
        organizationId: user.organizationId,
        clientId,
        userId: user.id,
        action: "CONTENT_UPDATED",
        entityType: "CONTENT",
        entityId: contentId,
        description: `Updated content item "${updatedItem.title}" by ${user.name}.`,
      },
    });

    return NextResponse.json({
      success: true,
      item: {
        ...updatedItem,
        variants: updatedVariants,
      },
    });
  } catch (error: any) {
    const status = error.message?.startsWith("403") ? 403 : error.message?.startsWith("401") ? 401 : 500;
    return NextResponse.json({ error: error.message || "Failed to update content" }, { status });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ clientId: string; contentId: string }> }
) {
  try {
    const { clientId, contentId } = await params;
    const { user } = await requirePermission(clientId, "content:delete");

    const item = await db.contentItem.findUnique({
      where: { id: contentId },
    });

    if (!item || item.clientId !== clientId) {
      return NextResponse.json({ error: "Content item not found" }, { status: 404 });
    }

    await db.contentItem.delete({
      where: { id: contentId },
    });

    await db.activityLog.create({
      data: {
        organizationId: user.organizationId,
        clientId,
        userId: user.id,
        action: "CONTENT_DELETED",
        entityType: "CONTENT",
        entityId: contentId,
        description: `Deleted content item "${item.title}" by ${user.name}.`,
      },
    });

    return NextResponse.json({ success: true, message: "Item deleted successfully" });
  } catch (error: any) {
    const status = error.message?.startsWith("403") ? 403 : 500;
    return NextResponse.json({ error: error.message || "Failed to delete content" }, { status });
  }
}
