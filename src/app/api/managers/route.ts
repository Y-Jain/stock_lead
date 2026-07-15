import { NextResponse } from "next/server";
import db from "@/db";
import * as argon2 from "argon2";
import { z } from "zod";
import { headers } from "next/headers";

const managerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1, "Name is required"),
  address: z.string().optional(),
  employee_id: z.string().optional(),
  phone: z.string().optional(),
  department: z.string().optional(),
  admin_id: z.string().uuid().optional(),
});

export async function GET(request: Request) {
  try {
    const headersList = await headers();
    const userId = headersList.get("x-user-id");
    const userRole = headersList.get("x-user-role");
    
    const url = new URL(request.url);
    const filterAdminId = url.searchParams.get("admin_id");

    let query = db("managers")
      .select(
        "managers.*",
        "users.email",
        "users.is_active",
        "users.last_login",
        db.raw(`
          (SELECT COUNT(*) FROM leads WHERE leads.manager_id = managers.id) as total_leads
        `),
        db.raw(`
          (SELECT title FROM forms 
           JOIN form_assignments ON forms.id = form_assignments.form_id 
           WHERE form_assignments.manager_id = managers.id 
           LIMIT 1) as form_title
        `),
        "admin_user.email as admin_email"
      )
      .leftJoin("users", "managers.user_id", "users.id")
      .leftJoin("users as admin_user", "managers.admin_id", "admin_user.id")
      .orderBy("managers.created_at", "desc");

    if (userRole === "admin") {
      query = query.where("managers.admin_id", userId);
    } else if (userRole === "superadmin" && filterAdminId) {
      query = query.where("managers.admin_id", filterAdminId);
    }

    const managers = await query;
      
    return NextResponse.json({ data: managers });
  } catch (error) {
    console.error("Fetch managers error:", error);
    return NextResponse.json({ error: "Failed to fetch managers" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsedData = managerSchema.safeParse(body);
    
    if (!parsedData.success) {
      return NextResponse.json({ error: parsedData.error.issues[0].message }, { status: 400 });
    }

    const headersList = await headers();
    const userId = headersList.get("x-user-id");
    const userRole = headersList.get("x-user-role");

    const { email, password, name, address, employee_id, phone, department, admin_id } = parsedData.data;

    let targetAdminId = null;
    if (userRole === "admin") {
      targetAdminId = userId;
    } else if (userRole === "superadmin") {
      targetAdminId = admin_id || userId;
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
      const baseUrl = process.env.NEXT_URL || "http://localhost:3000";
      const form_url = `${baseUrl}/form/${tracker_id}`;

      // 3. Create Manager
      const [manager] = await trx("managers").insert({
        user_id: user.id,
        admin_id: targetAdminId,
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
