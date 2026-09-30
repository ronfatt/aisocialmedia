import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const status = url.searchParams.get("status");
    const clientId = url.searchParams.get("clientId");

    const whereClause: any = {
      organizationId: user.organizationId,
    };

    if (status && status !== "ALL") {
      whereClause.status = status;
    }
    if (clientId && clientId !== "ALL") {
      whereClause.clientId = clientId;
    }

    const requests = await db.approvalRequest.findMany({
      where: whereClause,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            industry: true,
          },
        },
        contentItem: {
          select: {
            id: true,
            title: true,
            status: true,
            contentType: true,
            mediaUrls: true,
            createdAt: true,
            variants: {
              select: {
                id: true,
                platform: true,
                approvalStatus: true,
                caption: true,
                headline: true,
              },
            },
          },
        },
        comments: {
          orderBy: { createdAt: "desc" },
          take: 3,
        },
      },
      orderBy: { submittedAt: "desc" },
    });

    return NextResponse.json({ requests });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch approvals" }, { status: 500 });
  }
}
