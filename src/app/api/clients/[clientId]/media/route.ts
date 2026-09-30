import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const { clientId } = await params;
    await requirePermission(clientId, "media:view");

    const media = await db.mediaAsset.findMany({
      where: { clientId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      media: media.map((m) => ({
        ...m,
        tags: JSON.parse(m.tags || "[]"),
      })),
    });
  } catch (error: any) {
    const status = error.message?.startsWith("403") ? 403 : error.message?.startsWith("401") ? 401 : 500;
    return NextResponse.json({ error: error.message || "Failed to fetch media" }, { status });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const { clientId } = await params;
    const { user } = await requirePermission(clientId, "media:upload");

    const body = await req.json();
    const { fileName, fileUrl, fileType = "image/png", fileSize = 1000000, category = "Images", tags = [] } = body;

    if (!fileName || !fileUrl) {
      return NextResponse.json({ error: "File name and URL are required" }, { status: 400 });
    }

    const asset = await db.mediaAsset.create({
      data: {
        clientId,
        fileName,
        fileUrl,
        fileType,
        fileSize: Number(fileSize) || 1024000,
        category,
        tags: JSON.stringify(tags),
        uploadedBy: user.name,
      },
    });

    await db.activityLog.create({
      data: {
        organizationId: user.organizationId,
        clientId,
        userId: user.id,
        action: "MEDIA_UPLOADED",
        entityType: "MEDIA",
        entityId: asset.id,
        description: `Uploaded media asset "${asset.fileName}" in category "${category}" by ${user.name}.`,
      },
    });

    return NextResponse.json({ success: true, asset }, { status: 201 });
  } catch (error: any) {
    const status = error.message?.startsWith("403") ? 403 : error.message?.startsWith("401") ? 401 : 500;
    return NextResponse.json({ error: error.message || "Failed to upload media" }, { status });
  }
}
