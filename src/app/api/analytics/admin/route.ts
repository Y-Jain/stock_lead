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

    // Generate dates for last 7 days
    const trendDataMap = new Map();
    const today = new Date();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const name = dayNames[d.getDay()];
      const dateStr = d.toISOString().split('T')[0];
      trendDataMap.set(dateStr, { name, leads: 0, conversion: 0 });
    }

    // Fetch leads for last 7 days
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6); // To include today and 6 days before
    sevenDaysAgo.setHours(0, 0, 0, 0);
    
    const recentLeads = await db("leads")
      .select("status", "created_at")
      .where("created_at", ">=", sevenDaysAgo.toISOString());
      
    recentLeads.forEach((lead: any) => {
      const date = new Date(lead.created_at);
      const dateStr = date.toISOString().split('T')[0];
      if (trendDataMap.has(dateStr)) {
        const item = trendDataMap.get(dateStr);
        item.leads += 1;
        if (lead.status?.toLowerCase() === 'converted') {
          item.conversion += 1;
        }
      }
    });

    const trendData = Array.from(trendDataMap.values());

    return NextResponse.json({
      data: {
        kpis: {
          totalLeads,
          totalManagers,
          totalForms,
          conversionRate
        },
        statusBreakdown,
        trendData
      }
    });
  } catch (error) {
    console.error("Admin analytics error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
