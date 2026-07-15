import { NextResponse } from "next/server";
import { headers } from "next/headers";
import db from "@/db";

export async function GET(request: Request) {
  try {
    const headersList = await headers();
    const userId = headersList.get("x-user-id");
    const userRole = headersList.get("x-user-role");

    const url = new URL(request.url);
    const filterAdminId = url.searchParams.get("admin_id");

    const adminFilter = userRole === "admin" ? userId : (userRole === "superadmin" && filterAdminId ? filterAdminId : null);
    let leadsQuery = db("leads").count("leads.id as count");
    let managersQuery = db("managers").count("managers.id as count");
    let formsQuery = db("forms").count("forms.id as count");
    let convertedLeadsQuery = db("leads").whereIn("leads.status", ["Converted", "converted"]).count("leads.id as count");
    let statusBreakdownQuery = db("leads").select("leads.status").count("leads.id as count").groupBy("leads.status");

    if (adminFilter) {
      leadsQuery = leadsQuery.join("managers", "leads.manager_id", "managers.id").where("managers.admin_id", adminFilter);
      managersQuery = managersQuery.where("managers.admin_id", adminFilter);
      // Forms are assigned to managers. We can count forms assigned to the scoped managers
      formsQuery = formsQuery
        .join("form_assignments", "forms.id", "form_assignments.form_id")
        .join("managers", "form_assignments.manager_id", "managers.id")
        .where("managers.admin_id", adminFilter)
        .countDistinct("forms.id as count");
      convertedLeadsQuery = convertedLeadsQuery.join("managers", "leads.manager_id", "managers.id").where("managers.admin_id", adminFilter);
      statusBreakdownQuery = statusBreakdownQuery.join("managers", "leads.manager_id", "managers.id").where("managers.admin_id", adminFilter);
    }

    const totalLeadsRaw = await leadsQuery.first();
    const totalManagersRaw = await managersQuery.first();
    const totalFormsRaw = await formsQuery.first();

    const totalLeads = Number(totalLeadsRaw?.count || 0);
    const totalManagers = Number(totalManagersRaw?.count || 0);
    const totalForms = Number(totalFormsRaw?.count || 0);

    const convertedLeadsRaw = await convertedLeadsQuery.first();
    const convertedLeads = Number(convertedLeadsRaw?.count || 0);
    
    const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : "0.0";

    const statusBreakdown = await statusBreakdownQuery;

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
    
    let recentLeadsQuery = db("leads")
      .select("leads.status", "leads.created_at")
      .where("leads.created_at", ">=", sevenDaysAgo.toISOString());
      
    if (adminFilter) {
      recentLeadsQuery = recentLeadsQuery.join("managers", "leads.manager_id", "managers.id").where("managers.admin_id", adminFilter);
    }
    
    const recentLeads = await recentLeadsQuery;
      
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
