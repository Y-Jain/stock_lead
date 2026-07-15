import { NextResponse } from "next/server";
import db from "@/db";
import * as argon2 from "argon2";
import { z } from "zod";
import crypto from "crypto";

const adminSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  is_active: z.boolean().default(true)
});

export async function GET() {
  try {
    const adminRole = await db("roles").where("name", "admin").first();
    if (!adminRole) return NextResponse.json({ data: [] });

    const admins = await db("users")
      .select("id", "email", "is_active", "last_login", "created_at")
      .where("role_id", adminRole.id)
      .orderBy("created_at", "desc");
      
    return NextResponse.json({ data: admins });
  } catch (error) {
    console.error("Fetch admins error:", error);
    return NextResponse.json({ error: "Failed to fetch admins" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsedData = adminSchema.safeParse(body);
    
    if (!parsedData.success) {
      return NextResponse.json({ error: parsedData.error.issues[0].message }, { status: 400 });
    }

    const { email, password, is_active } = parsedData.data;

    // Check existing
    const existing = await db("users").where("email", email).first();
    if (existing) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

    const adminRole = await db("roles").where("name", "admin").first();

    const passwordHash = await argon2.hash(password);
    const userId = crypto.randomUUID();
    
    const [user] = await db("users").insert({
      id: userId,
      email,
      password_hash: passwordHash,
      role_id: adminRole.id,
      is_active
    }).returning(["id", "email", "is_active", "created_at"]);

    return NextResponse.json({ data: user }, { status: 201 });
  } catch (error) {
    console.error("Error creating admin:", error);
    return NextResponse.json({ error: "Failed to create admin" }, { status: 500 });
  }
}
