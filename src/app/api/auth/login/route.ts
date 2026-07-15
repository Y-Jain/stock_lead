import { NextResponse } from "next/server";
import db from "@/db";
import * as argon2 from "argon2";
import { signJwtToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { loginLimiter } from "@/lib/rate-limit";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

export async function POST(request: Request) {
  try {
    const ip_address = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "Unknown";
    
    // Rate Limiting
    if (!loginLimiter.check(ip_address)) {
      return NextResponse.json({ error: "Too many login attempts" }, { status: 429 });
    }

    const rawData = await request.json();
    const parsedData = loginSchema.safeParse(rawData);
    
    if (!parsedData.success) {
      return NextResponse.json({ error: "Invalid email or password format" }, { status: 400 });
    }

    const { email, password } = parsedData.data;

    // Lookup user and join with roles
    const user = await db("users")
      .join("roles", "users.role_id", "=", "roles.id")
      .select("users.*", "roles.name as role_name")
      .where("users.email", email)
      .first();

    if (!user || !user.is_active) {
      return NextResponse.json({ error: "Invalid credentials or inactive account" }, { status: 401 });
    }

    // Verify password
    const isValid = await argon2.verify(user.password_hash, password);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Check if user is a manager to get manager_id
    let managerId = null;
    if (user.role_name === "manager") {
      const manager = await db("managers").where("user_id", user.id).first();
      if (manager) {
        managerId = manager.id;
      }
    }

    // Generate JWT
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role_name,
      manager_id: managerId
    };

    const token = await signJwtToken(payload);

    // Set HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set("crm_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return NextResponse.json({ success: true, data: payload }, { status: 200 });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
