import { NextResponse } from "next/server";
import db from "@/db";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const form = await db("forms").where("id", id).first();
    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    const fields = await db("form_fields")
      .where("form_id", id)
      .orderBy("display_order", "asc");

    return NextResponse.json({ data: { ...form, fields } });
  } catch (error) {
    console.error("Error fetching form:", error);
    return NextResponse.json({ error: "Failed to fetch form" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, description, submit_btn_text, success_message, fields } = body;

    if (!title || !fields || !Array.isArray(fields) || fields.length === 0) {
      return NextResponse.json({ error: "Title and at least one field are required" }, { status: 400 });
    }

    const updatedForm = await db.transaction(async (trx) => {
      // 1. Update Form
      const [form] = await trx("forms").where("id", id).update({
        title,
        description,
        submit_btn_text,
        success_message,
        updated_at: new Date()
      }).returning("*");

      if (!form) throw new Error("Form not found");

      // 2. Wipe old fields
      await trx("form_fields").where("form_id", id).del();

      // 3. Insert new fields
      const fieldsToInsert = fields.map((field: any, index: number) => ({
        form_id: id,
        type: field.type,
        name: field.name,
        label: field.label,
        placeholder: field.placeholder,
        is_required: field.is_required || false,
        validation_rules: field.validation_rules ? JSON.stringify(field.validation_rules) : null,
        display_order: index
      }));

      await trx("form_fields").insert(fieldsToInsert);

      return form;
    });

    return NextResponse.json({ data: updatedForm });
  } catch (error) {
    console.error("Error updating form:", error);
    return NextResponse.json({ error: "Failed to update form" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    // Database cascading will automatically delete form_fields, leads, and lead_notes
    const deletedCount = await db("forms").where("id", id).del();
    
    if (deletedCount === 0) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting form:", error);
    return NextResponse.json({ error: "Failed to delete form" }, { status: 500 });
  }
}
