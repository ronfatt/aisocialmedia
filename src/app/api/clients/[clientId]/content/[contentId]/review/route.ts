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

    const body = await req.json();
    const {
      action, // 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES'
      platformScope = "ALL", // 'ALL' | 'FACEBOOK' | 'INSTAGRAM' | 'TIKTOK'
      comment,
      variantApprovals, // optional map e.g. { FACEBOOK: 'APPROVED', INSTAGRAM: 'CHANGES_REQUESTED' }
    } = body;

    if (!["APPROVE", "REJECT", "REQUEST_CHANGES"].includes(action)) {
      return NextResponse.json({ error: "Invalid action. Must be APPROVE, REJECT, or REQUEST_CHANGES" }, { status: 400 });
    }

    const item = await db.contentItem.findUnique({
      where: { id: contentId },
      include: {
        variants: true,
        approvalRequests: {
          orderBy: { submittedAt: "desc" },
          take: 1,
        },
      },
    });

    if (!item || item.clientId !== clientId) {
      return NextResponse.json({ error: "Content item not found" }, { status: 404 });
    }

    const latestApproval = item.approvalRequests[0];

    // Update variant approval statuses
    if (variantApprovals && typeof variantApprovals === "object") {
      for (const [platform, statusVal] of Object.entries(variantApprovals)) {
        await db.postVariant.updateMany({
          where: { contentItemId: contentId, platform },
          data: { approvalStatus: statusVal as string },
        });
      }
    } else if (platformScope === "ALL") {
      const targetStatus = action === "APPROVE" ? "APPROVED" : action === "REQUEST_CHANGES" ? "CHANGES_REQUESTED" : "REJECTED";
      await db.postVariant.updateMany({
        where: { contentItemId: contentId },
        data: { approvalStatus: targetStatus },
      });
    } else {
      const targetStatus = action === "APPROVE" ? "APPROVED" : action === "REQUEST_CHANGES" ? "CHANGES_REQUESTED" : "REJECTED";
      await db.postVariant.updateMany({
        where: { contentItemId: contentId, platform: platformScope },
        data: { approvalStatus: targetStatus },
      });
    }

    // Refresh variants to inspect overall status
    const allVariants = await db.postVariant.findMany({
      where: { contentItemId: contentId },
    });

    const allApproved = allVariants.length > 0 && allVariants.every((v) => v.approvalStatus === "APPROVED");
    const anyChangesRequested = allVariants.some((v) => v.approvalStatus === "CHANGES_REQUESTED");
    const allRejected = allVariants.length > 0 && allVariants.every((v) => v.approvalStatus === "REJECTED");

    let newContentStatus = item.status;
    if (action === "APPROVE") {
      newContentStatus = allApproved ? "APPROVED" : "READY_FOR_REVIEW";
    } else if (action === "REQUEST_CHANGES" || anyChangesRequested) {
      newContentStatus = "CHANGES_REQUESTED";
    } else if (action === "REJECT" || allRejected) {
      newContentStatus = "DRAFT";
    }

    // Update ContentItem
    await db.contentItem.update({
      where: { id: contentId },
      data: {
        status: newContentStatus,
      },
    });

    // Update or close latest approval request
    if (latestApproval) {
      const reqStatus = action === "APPROVE" ? (allApproved ? "APPROVED" : "PENDING") : action === "REQUEST_CHANGES" ? "CHANGES_REQUESTED" : "REJECTED";
      await db.approvalRequest.update({
        where: { id: latestApproval.id },
        data: {
          status: reqStatus,
          reviewedAt: new Date(),
          reviewedBy: user.name,
          reviewComment: comment || null,
        },
      });

      if (comment && comment.trim() !== "") {
        await db.approvalComment.create({
          data: {
            organizationId: user.organizationId,
            clientId,
            approvalRequestId: latestApproval.id,
            userId: user.id,
            userName: user.name,
            comment: `[${action} ${platformScope}] ${comment}`,
          },
        });
      }
    }

    // Log Activity
    await db.activityLog.create({
      data: {
        organizationId: user.organizationId,
        clientId,
        userId: user.id,
        action: `CONTENT_${action}`,
        entityType: "CONTENT",
        entityId: contentId,
        description: `Review action ${action} performed on "${item.title}" (scope: ${platformScope}) by ${user.name}. Overall status: ${newContentStatus}.`,
      },
    });

    return NextResponse.json({
      success: true,
      contentStatus: newContentStatus,
      allApproved,
      message: `Action ${action} processed successfully`,
    });
  } catch (error: any) {
    const status = error.message?.startsWith("403") ? 403 : error.message?.startsWith("401") ? 401 : 500;
    return NextResponse.json({ error: error.message || "Failed to process review" }, { status });
  }
}
