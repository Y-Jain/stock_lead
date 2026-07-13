import { NextResponse } from "next/server";
import db from "@/db";

export async function GET(request: Request) {
  try {
    const forms = await db("forms").select("*");
    
    // Optional: fetch fields for each form if needed in the list view
    // For now, just return the forms metadata
    return NextResponse.json({ data: forms });
  } catch (error) {
    console.error("Error fetching forms:", error);
    return NextResponse.json({ error: "Failed to fetch forms" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, submit_btn_text, success_message, fields, assigned_managers } = body;

    if (!title || !fields || !Array.isArray(fields) || fields.length === 0) {
      return NextResponse.json({ error: "Title and at least one field are required" }, { status: 400 });
    }

    const newForm = await db.transaction(async (trx) => {
      // 1. Create Form
      const [form] = await trx("forms").insert({
        title,
        description,
        submit_btn_text,
        success_message
      }).returning("*");

      // 2. Create Fields
      const fieldsToInsert = fields.map((field: any, index: number) => ({
        form_id: form.id,
        type: field.type,
        name: field.name,
        label: field.label,
        placeholder: field.placeholder,
        is_required: field.is_required || false,
        validation_rules: field.validation_rules ? JSON.stringify(field.validation_rules) : null,
        display_order: index
      }));

      await trx("form_fields").insert(fieldsToInsert);

      // 3. Optional: Create Assignments if managers were selected during creation
      if (assigned_managers && Array.isArray(assigned_managers) && assigned_managers.length > 0) {
        const assignmentsToInsert = assigned_managers.map((manager_id: string) => ({
          form_id: form.id,
          manager_id
        }));
        await trx("form_assignments").insert(assignmentsToInsert);
      }

      return form;
    });

    return NextResponse.json({ data: newForm }, { status: 201 });
  } catch (error) {
    console.error("Error creating form:", error);
    return NextResponse.json({ error: "Failed to create form" }, { status: 500 });
  }
}
