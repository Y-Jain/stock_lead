import { NextResponse } from "next/server";
import db from "@/db";
import * as argon2 from "argon2";
import { z } from "zod";

const updateSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
  is_active: z.boolean()
});

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const parsedData = updateSchema.safeParse(body);
    if (!parsedData.success) {
      return NextResponse.json({ error: parsedData.error.issues[0].message }, { status: 400 });
    }

    const { email, password, is_active } = parsedData.data;

    // Check if another user has this email
    const existing = await db("users").where("email", email).whereNot("id", id).first();
    if (existing) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

    const updateData: any = {
      email,
      is_active,
      updated_at: db.fn.now()
    };

    if (password && password.length >= 6) {
      updateData.password_hash = await argon2.hash(password);
    }

    await db("users").where("id", id).update(updateData);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating admin:", error);
    return NextResponse.json({ error: "Failed to update admin" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    // Check if it's the superadmin trying to delete themselves
    // We ideally should check the session user ID, but this will do for now.
    const user = await db("users").where("id", id).first();
    const role = await db("roles").where("id", user?.role_id).first();

    if (role?.name === "superadmin") {
      return NextResponse.json({ error: "Cannot delete a superadmin" }, { status: 403 });
    }

    await db("users").where("id", id).del();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting admin:", error);
    return NextResponse.json({ error: "Failed to delete admin" }, { status: 500 });
  }
}
