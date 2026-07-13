import { NextResponse } from "next/server";
import db from "@/db";
import * as argon2 from "argon2";

export async function GET(request: Request) {
  try {
    const managers = await db("managers")
      .join("users", "managers.user_id", "=", "users.id")
      .leftJoin("form_assignments", "managers.id", "=", "form_assignments.manager_id")
      .leftJoin("forms", "form_assignments.form_id", "=", "forms.id")
      .select(
        "managers.id",
        "managers.name",
        "managers.address",
        "managers.employee_id",
        "managers.department",
        "managers.phone",
        "managers.tracker_id",
        "managers.form_url",
        "users.email",
        "users.is_active",
        "forms.title as form_title"
      );
    return NextResponse.json({ data: managers });
  } catch (error) {
    console.error("Error fetching managers:", error);
    return NextResponse.json({ error: "Failed to fetch managers" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, address, employee_id, phone, department } = body;

    // Validate simple inputs
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const newManager = await db.transaction(async (trx) => {
      // 1. Create User
      const passwordHash = await argon2.hash(password);
      const [user] = await trx("users").insert({
        email,
        password_hash: passwordHash,
        role_id: (await trx("roles").where("name", "manager").first()).id,
      }).returning("*");

      // 2. Generate Tracker ID
      const tracker_id = Math.random().toString(36).substring(2, 10);
      const form_url = `https://crm.company.com/form/${tracker_id}`; // Example base URL

      // 3. Create Manager
      const [manager] = await trx("managers").insert({
        user_id: user.id,
        name,
        address,
        employee_id,
        phone,
        department,
        tracker_id,
        form_url
      }).returning("*");

      return { ...manager, email: user.email };
    });

    return NextResponse.json({ data: newManager }, { status: 201 });
  } catch (error) {
    console.error("Error creating manager:", error);
    return NextResponse.json({ error: "Failed to create manager" }, { status: 500 });
  }
}
