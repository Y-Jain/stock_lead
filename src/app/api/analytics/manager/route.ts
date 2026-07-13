import { NextResponse } from "next/server";
import { headers } from "next/headers";
import db from "@/db";

export async function GET() {
  try {
    const headersList = await headers();
    const managerId = headersList.get("x-manager-id");

    if (!managerId) {
      return NextResponse.json({ error: "Manager ID missing" }, { status: 400 });
    }

    const totalLeadsRaw = await db("leads").where("manager_id", managerId).count("id as count").first();
    const totalLeads = Number(totalLeadsRaw?.count || 0);

    const convertedLeadsRaw = await db("leads").where("manager_id", managerId).whereIn("status", ["Converted", "converted"]).count("id as count").first();
    const convertedLeads = Number(convertedLeadsRaw?.count || 0);
    
    const followUpsRaw = await db("leads").where("manager_id", managerId).whereIn("status", ["New", "Follow Up"]).count("id as count").first();
    const actionRequired = Number(followUpsRaw?.count || 0);

    const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : "0.0";

    const recentActivity = await db("leads")
      .select("id", "status", "priority", "custom_data", "updated_at")
      .where("manager_id", managerId)
      .orderBy("updated_at", "desc")
      .limit(5);

    const formAssignment = await db("form_assignments")
      .join("forms", "form_assignments.form_id", "=", "forms.id")
      .join("managers", "form_assignments.manager_id", "=", "managers.id")
      .select("managers.tracker_id", "forms.title")
      .where("form_assignments.manager_id", managerId)
      .first();

    return NextResponse.json({
      data: {
        kpis: {
          totalLeads,
          convertedLeads,
          conversionRate,
          actionRequired
        },
        recentActivity,
        formAssignment
      }
    });
  } catch (error) {
    console.error("Manager analytics error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
