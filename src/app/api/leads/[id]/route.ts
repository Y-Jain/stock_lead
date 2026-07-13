import { NextResponse } from "next/server";
import db from "@/db";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const lead = await db("leads")
      .join("forms", "leads.form_id", "=", "forms.id")
      .leftJoin("managers", "leads.manager_id", "=", "managers.id")
      .leftJoin("users", "managers.user_id", "=", "users.id")
      .select(
        "leads.*",
        "forms.title as form_title",
        "managers.name as manager_name",
        "users.email as manager_email"
      )
      .where("leads.id", id)
      .first();

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const notes = await db("lead_notes")
      .leftJoin("users", "lead_notes.author_id", "=", "users.id")
      .select("lead_notes.*", "users.email as author_email")
      .where("lead_id", id)
      .orderBy("created_at", "desc");

    return NextResponse.json({ data: { lead, notes } });
  } catch (error) {
    console.error("Error fetching lead:", error);
    return NextResponse.json({ error: "Failed to fetch lead" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, priority, expected_version, new_note, custom_data } = body;

    const result = await db.transaction(async (trx) => {
      // 1. Optimistic Locking Check & Update
      if (status || priority || custom_data) {
        if (!expected_version) {
          throw new Error("expected_version is required for updates");
        }

        const updatePayload: any = {
          version: expected_version + 1, // Increment version
          updated_at: trx.fn.now()
        };
        if (status) updatePayload.status = status;
        if (priority) updatePayload.priority = priority;
        if (custom_data) updatePayload.custom_data = custom_data;

        const updatedRows = await trx("leads")
          .where("id", id)
          .andWhere("version", expected_version)
          .update(updatePayload);

        if (updatedRows === 0) {
          throw new Error("Optimistic locking failure: Lead was modified by another user.");
        }
      }

      // 2. Add Note
      if (new_note) {
        await trx("lead_notes").insert({
          lead_id: id,
          content: new_note
          // author_id would come from session in a real app
        });
      }

      return await trx("leads").where("id", id).first();
    });

    return NextResponse.json({ data: result });
  } catch (error: any) {
    console.error("Error updating lead:", error);
    if (error.message.includes("Optimistic locking failure")) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    return NextResponse.json({ error: error.message || "Failed to update lead" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    // Notes delete cascade automatically
    await db("leads").where("id", id).del();

    return NextResponse.json({ message: "Lead deleted successfully" });
  } catch (error) {
    console.error("Error deleting lead:", error);
    return NextResponse.json({ error: "Failed to delete lead" }, { status: 500 });
  }
}
