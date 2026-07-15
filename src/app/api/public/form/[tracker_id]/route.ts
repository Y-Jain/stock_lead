import { NextResponse } from "next/server";
import db from "@/db";

export async function GET(request: Request, { params }: { params: Promise<{ tracker_id: string }> }) {
  try {
    const { tracker_id } = await params;
    // Find the manager by tracker_id
    const manager = await db("managers").where("tracker_id", tracker_id).first();
    if (!manager) {
      return NextResponse.json({ error: "Invalid tracker ID" }, { status: 404 });
    }

    // Find the form assigned to this manager
    const assignment = await db("form_assignments").where("manager_id", manager.id).first();
    if (!assignment) {
      return NextResponse.json({ error: "No form assigned to this link" }, { status: 404 });
    }

    // Fetch the form
    const form = await db("forms").where("id", assignment.form_id).first();
    if (!form || !form.is_active) {
      return NextResponse.json({ error: "Form is inactive or unavailable" }, { status: 404 });
    }

    // Fetch the form fields
    const fields = await db("form_fields").where("form_id", form.id).orderBy("display_order", "asc");

    // Fetch the logo_url
    const logoSetting = await db("settings").where("key", "logo_url").first();
    const logo_url = logoSetting ? logoSetting.value : "/logo.png";

    return NextResponse.json({ data: { form, fields, manager_id: manager.id, logo_url } });
  } catch (error) {
    console.error("Error fetching public form:", error);
    return NextResponse.json({ error: "Failed to fetch form" }, { status: 500 });
  }
}
