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

    const url = new URL(req.url);
    const status = url.searchParams.get("status");
    const campaignId = url.searchParams.get("campaignId");
    const pillarId = url.searchParams.get("pillarId");
    const search = url.searchParams.get("search");

    const whereClause: any = { clientId };

    if (status && status !== "ALL") {
      whereClause.status = status;
    }
    if (campaignId && campaignId !== "ALL") {
      whereClause.campaignId = campaignId;
    }
    if (pillarId && pillarId !== "ALL") {
      whereClause.contentPillarId = pillarId;
    }
    if (search && search.trim() !== "") {
      whereClause.OR = [
        { title: { contains: search } },
        { coreMessage: { contains: search } },
        { internalBrief: { contains: search } },
        { contentPillar: { contains: search } },
      ];
    }

    const items = await db.contentItem.findMany({
      where: whereClause,
      include: {
        campaign: { select: { id: true, name: true } },
        contentPillarRel: { select: { id: true, title: true } },
        variants: {
          orderBy: { platform: "asc" },
        },
        approvalRequests: {
          orderBy: { submittedAt: "desc" },
          take: 1,
        },
        _count: {
          select: {
            variants: true,
            versions: true,
            approvalRequests: true,
          },
        },
      },
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
    const {
      title,
      description,
      coreMessage,
      internalBrief,
      objective,
      contentType = "IMAGE",
      campaignId,
      contentPillarId,
      contentPillar,
      targetAudience,
      targetLocation,
      callToAction,
      productsServices,
      platforms = ["FACEBOOK", "INSTAGRAM", "TIKTOK"],
      mediaUrls = [],
      internalNotes,
      scheduledFor,
      assignedTo,
      status = "DRAFT",
      variants = [],
    } = body;

    if (!title || title.trim() === "") {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const platformList = Array.isArray(platforms) ? platforms : [platforms];
    const mediaUrlsList = Array.isArray(mediaUrls) ? mediaUrls : [];

    // Create Master Content Item
    const newItem = await db.contentItem.create({
      data: {
        organizationId: user.organizationId,
        clientId,
        campaignId: campaignId || null,
        contentPillarId: contentPillarId || null,
        title: title.trim(),
        description: description || coreMessage || "",
        coreMessage: coreMessage || null,
        internalBrief: internalBrief || null,
        objective: objective || null,
        contentPillar: contentPillar || null,
        contentType,
        status,
        targetAudience: targetAudience || null,
        targetLocation: targetLocation || null,
        callToAction: callToAction || null,
        productsServices: productsServices || null,
        platforms: JSON.stringify(platformList),
        mediaUrls: JSON.stringify(mediaUrlsList),
        internalNotes: internalNotes || null,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
        assignedTo: assignedTo || null,
        createdBy: user.name,
      },
    });

    // Create Variants if provided or initialize default skeletons
    const createdVariants = [];
    if (Array.isArray(variants) && variants.length > 0) {
      for (const v of variants) {
        const variant = await db.postVariant.create({
          data: {
            organizationId: user.organizationId,
            clientId,
            contentItemId: newItem.id,
            platform: v.platform,
            headline: v.headline || null,
            hook: v.hook || null,
            caption: v.caption || "",
            cta: v.cta || callToAction || null,
            hashtags: v.hashtags || null,
            onScreenText: v.onScreenText || null,
            videoIdea: v.videoIdea || null,
            platformNotes: v.platformNotes || null,
            mediaSelection: JSON.stringify(v.mediaSelection || mediaUrlsList),
            language: v.language || "English",
            generationStatus: v.caption ? "GENERATED" : "IDLE",
            approvalStatus: "PENDING",
            isEditedManually: Boolean(v.isEditedManually),
          },
        });
        createdVariants.push(variant);
      }
    } else {
      // Auto-initialize empty variants for each selected platform
      for (const plt of platformList) {
        const variant = await db.postVariant.create({
          data: {
            organizationId: user.organizationId,
            clientId,
            contentItemId: newItem.id,
            platform: plt,
            caption: "",
            language: "English",
            generationStatus: "IDLE",
            approvalStatus: "PENDING",
            mediaSelection: JSON.stringify(mediaUrlsList),
          },
        });
        createdVariants.push(variant);
      }
    }

    // Save initial version snapshot
    await db.contentVersion.create({
      data: {
        organizationId: user.organizationId,
        clientId,
        contentItemId: newItem.id,
        versionNumber: 1,
        contentSnapshot: JSON.stringify({
          master: {
            title: newItem.title,
            coreMessage: newItem.coreMessage,
            internalBrief: newItem.internalBrief,
            objective: newItem.objective,
            mediaUrls: mediaUrlsList,
          },
          variants: createdVariants,
        }),
        changeSummary: "Initial master content item created",
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
        description: `Created master content item "${newItem.title}" with ${createdVariants.length} platform variant(s) by ${user.name}.`,
      },
    });

    return NextResponse.json({
      success: true,
      item: {
        ...newItem,
        variants: createdVariants,
      },
    }, { status: 201 });
  } catch (error: any) {
    const status = error.message?.startsWith("403") ? 403 : error.message?.startsWith("401") ? 401 : 500;
    return NextResponse.json({ error: error.message || "Failed to create content" }, { status });
  }
}
