import { NextResponse } from "next/server";
import { headers } from "next/headers";
import db from "@/db";

export async function GET(request: Request) {
  try {
    const headersList = await headers();
    const managerId = headersList.get("x-manager-id");
    const userId = headersList.get("x-user-id");
    const userRole = headersList.get("x-user-role");

    const url = new URL(request.url);
    const filterAdminId = url.searchParams.get("admin_id");

    let query = db("leads")
      .join("forms", "leads.form_id", "=", "forms.id")
      .leftJoin("managers", "leads.manager_id", "=", "managers.id")
      .leftJoin("users as manager_user", "managers.user_id", "=", "manager_user.id")
      .select(
        "leads.id",
        "leads.status",
        "leads.priority",
        "leads.custom_data",
        "leads.created_at",
        "leads.manager_id",
        "forms.title as form_title",
        "manager_user.email as manager_email",
        "managers.name as manager_name"
      )
      .orderBy("leads.created_at", "desc");

    // Strictly enforce manager isolation if they are a manager
    if (managerId) {
      query = query.where("leads.manager_id", managerId);
    } else if (userRole === "admin") {
      query = query.where("managers.admin_id", userId);
    } else if (userRole === "superadmin" && filterAdminId) {
      query = query.where("managers.admin_id", filterAdminId);
    }

    const leads = await query;
    return NextResponse.json({ data: leads });
  } catch (error) {
    console.error("Error fetching leads:", error);
    return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 });
  }
}
