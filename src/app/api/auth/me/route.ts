import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJwtToken } from "@/lib/auth";
import db from "@/db";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("crm_session")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const payload = await verifyJwtToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    // Optionally fetch fresh data from DB if needed, but for now payload is enough
    const user = await db("users")
      .select("id", "email", "is_active")
      .where("id", payload.id as string)
      .first();
      
    if (!user || !user.is_active) {
      return NextResponse.json({ error: "Account disabled" }, { status: 401 });
    }

    return NextResponse.json({ data: payload });
  } catch (error) {
    console.error("Auth me error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
