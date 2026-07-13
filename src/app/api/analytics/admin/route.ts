import { NextResponse } from "next/server";
import db from "@/db";

export async function GET() {
  try {
    const totalLeadsRaw = await db("leads").count("id as count").first();
    const totalManagersRaw = await db("managers").count("id as count").first();
    const totalFormsRaw = await db("forms").count("id as count").first();

    const totalLeads = Number(totalLeadsRaw?.count || 0);
    const totalManagers = Number(totalManagersRaw?.count || 0);
    const totalForms = Number(totalFormsRaw?.count || 0);

    const convertedLeadsRaw = await db("leads").whereIn("status", ["Converted", "converted"]).count("id as count").first();
    const convertedLeads = Number(convertedLeadsRaw?.count || 0);
    
    const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : "0.0";

    const statusBreakdown = await db("leads")
      .select("status")
      .count("id as count")
      .groupBy("status");

    return NextResponse.json({
      data: {
        kpis: {
          totalLeads,
          totalManagers,
          totalForms,
          conversionRate
        },
        statusBreakdown
      }
    });
  } catch (error) {
    console.error("Admin analytics error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
