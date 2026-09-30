import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ clientId: string; contentId: string }> }
) {
  try {
    const { clientId, contentId } = await params;
    const { user } = await requirePermission(clientId, "content:edit");

    const item = await db.contentItem.findUnique({
      where: { id: contentId },
      include: { variants: true },
    });

    if (!item || item.clientId !== clientId) {
      return NextResponse.json({ error: "Content item not found" }, { status: 404 });
    }

    if (item.variants.length === 0) {
      return NextResponse.json({ error: "Cannot submit content without any platform variants" }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const { platformScope = "ALL", assignedApprover, notes } = body;

    // Create Approval Request
    const request = await db.approvalRequest.create({
      data: {
        organizationId: user.organizationId,
        clientId,
        contentItemId: contentId,
        platformScope,
        requestedBy: user.name,
        assignedApprover: assignedApprover || null,
        status: "PENDING",
        reviewComment: notes || null,
      },
    });

    // Update ContentItem status
    await db.contentItem.update({
      where: { id: contentId },
      data: {
        status: "PENDING_APPROVAL",
      },
    });

    // Optionally add initial note as comment
    if (notes && notes.trim() !== "") {
      await db.approvalComment.create({
        data: {
          organizationId: user.organizationId,
          clientId,
          approvalRequestId: request.id,
          userId: user.id,
          userName: user.name,
          comment: notes,
        },
      });
    }

    await db.activityLog.create({
      data: {
        organizationId: user.organizationId,
        clientId,
        userId: user.id,
        action: "APPROVAL_REQUESTED",
        entityType: "CONTENT",
        entityId: contentId,
        description: `Submitted content item "${item.title}" for approval (scope: ${platformScope}) by ${user.name}.`,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Content submitted for approval successfully",
      approvalRequest: request,
    });
  } catch (error: any) {
    const status = error.message?.startsWith("403") ? 403 : error.message?.startsWith("401") ? 401 : 500;
    return NextResponse.json({ error: error.message || "Failed to submit for approval" }, { status });
  }
}
