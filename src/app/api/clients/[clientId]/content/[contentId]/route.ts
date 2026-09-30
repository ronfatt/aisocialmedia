import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth";

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
