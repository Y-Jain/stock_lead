import { NextResponse } from "next/server";
import db from "@/db";

export async function POST(request: Request, { params }: { params: Promise<{ tracker_id: string }> }) {
  try {
    const { tracker_id } = await params;
    const customData = await request.json();

    // Find the manager
    const manager = await db("managers").where("tracker_id", tracker_id).first();
    if (!manager) {
      return NextResponse.json({ error: "Invalid tracker ID" }, { status: 404 });
    }

    // Find the assigned form
    const assignment = await db("form_assignments").where("manager_id", manager.id).first();
    if (!assignment) {
      return NextResponse.json({ error: "No form assigned" }, { status: 404 });
    }

    // Get IP and User-Agent from headers
    const ip_address = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "Unknown";
    const user_agent = request.headers.get("user-agent") || "Unknown";

    // Insert Lead
    const [lead] = await db("leads").insert({
      manager_id: manager.id,
      form_id: assignment.form_id,
      custom_data: JSON.stringify(customData), // Store exact submission
      status: "New",
      priority: "Medium",
      ip_address,
      user_agent,
      version: 1
    }).returning("*");

    return NextResponse.json({ success: true, data: lead }, { status: 201 });
  } catch (error) {
    console.error("Error submitting form:", error);
    return NextResponse.json({ error: "Failed to submit form" }, { status: 500 });
  }
}
