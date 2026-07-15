import { NextResponse } from "next/server";
import db from "@/db";
import { formSubmitLimiter } from "@/lib/rate-limit";
import { z } from "zod";

const customDataSchema = z.record(z.string(), z.any()).refine(
  (data) => JSON.stringify(data).length < 5000, 
  { message: "Payload too large" }
);

export async function POST(request: Request, { params }: { params: Promise<{ tracker_id: string }> }) {
  try {
    const ip_address = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "Unknown";
    
    // Rate Limiting
    if (!formSubmitLimiter.check(ip_address)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const { tracker_id } = await params;
    const rawData = await request.json();
    
    // Input Validation
    const parsedData = customDataSchema.safeParse(rawData);
    if (!parsedData.success) {
      return NextResponse.json({ error: "Invalid payload format" }, { status: 400 });
    }
    const customData = parsedData.data;

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
