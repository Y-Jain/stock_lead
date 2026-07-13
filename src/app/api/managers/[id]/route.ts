import { NextResponse } from "next/server";
import db from "@/db";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const manager = await db("managers")
      .join("users", "managers.user_id", "=", "users.id")
      .leftJoin("form_assignments", "managers.id", "=", "form_assignments.manager_id")
      .select(
        "managers.id",
        "managers.name",
        "managers.address",
        "managers.employee_id",
        "managers.department",
        "managers.phone",
        "managers.tracker_id",
        "managers.form_url",
        "users.email",
        "users.is_active",
        "form_assignments.form_id"
      )
      .where("managers.id", id)
      .first();

    if (!manager) {
      return NextResponse.json({ error: "Manager not found" }, { status: 404 });
    }

    return NextResponse.json({ data: manager });
  } catch (error) {
    console.error("Error fetching manager:", error);
    return NextResponse.json({ error: "Failed to fetch manager" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { phone, department, is_active, form_id, name, address } = body;

    const updatedManager = await db.transaction(async (trx) => {
      // Update Manager fields
      const updates: any = {};
      if (phone !== undefined) updates.phone = phone;
      if (department !== undefined) updates.department = department;
      if (name !== undefined) updates.name = name;
      if (address !== undefined) updates.address = address;

      if (Object.keys(updates).length > 0) {
        await trx("managers")
          .where("id", id)
          .update(updates);
      }

      // Update User fields (like active status)
      if (is_active !== undefined) {
        const manager = await trx("managers").where("id", id).select("user_id").first();
        if (manager) {
          await trx("users").where("id", manager.user_id).update({ is_active });
        }
      }

      // Handle Form Assignment
      if (form_id !== undefined) {
        if (form_id === null || form_id === "") {
          await trx("form_assignments").where("manager_id", id).del();
        } else {
          const existing = await trx("form_assignments").where("manager_id", id).first();
          if (existing) {
            await trx("form_assignments").where("manager_id", id).update({ form_id });
          } else {
            await trx("form_assignments").insert({ manager_id: id, form_id });
          }
        }
      }

      // Fetch the updated full record
      return trx("managers")
        .join("users", "managers.user_id", "=", "users.id")
        .select(
          "managers.id",
          "managers.name",
          "managers.address",
          "managers.employee_id",
          "managers.department",
          "managers.phone",
          "users.email",
          "users.is_active"
        )
        .where("managers.id", id)
        .first();
    });

    return NextResponse.json({ data: updatedManager });
  } catch (error) {
    console.error("Error updating manager:", error);
    return NextResponse.json({ error: "Failed to update manager" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.transaction(async (trx) => {
      const manager = await trx("managers").where("id", id).select("user_id").first();
      if (manager) {
        // user_id cascade delete will delete manager, but safe to delete user
        await trx("users").where("id", manager.user_id).delete();
      }
    });

    return NextResponse.json({ message: "Manager deleted successfully" });
  } catch (error) {
    console.error("Error deleting manager:", error);
    return NextResponse.json({ error: "Failed to delete manager" }, { status: 500 });
  }
}
