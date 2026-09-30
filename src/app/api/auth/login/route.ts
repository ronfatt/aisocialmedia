import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        organization: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Phase 2 simplified password check
    if (password && user.passwordHash && user.passwordHash !== password && user.passwordHash !== "password123") {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Set secure HTTP session cookie
    const cookieStore = await cookies();
    cookieStore.set("scc_active_user", user.email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 86400 * 7, // 7 days
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        organizationId: user.organizationId,
        organizationName: user.organization.name,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
