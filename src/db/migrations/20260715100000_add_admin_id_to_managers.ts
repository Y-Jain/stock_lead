import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // 1. Add admin_id to managers
  await knex.schema.alterTable("managers", (table) => {
    table.uuid("admin_id").references("id").inTable("users").onDelete("CASCADE");
  });

  // 2. Fetch the first available admin to assign to existing managers
  const firstAdmin = await knex("users")
    .join("roles", "users.role_id", "=", "roles.id")
    .where("roles.name", "admin")
    .select("users.id")
    .first();

  if (firstAdmin) {
    await knex("managers").update({ admin_id: firstAdmin.id });
  }

  // 3. Make it notNullable if you want to enforce it later, but for now we leave it as nullable
  // just in case superadmin creates managers without assigning (if we allow that later). 
  // Let's make it notNullable since the prompt says they should select one or it defaults to first admin.
  // Actually, we can keep it nullable to be safe against errors, and handle it in application logic.
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("managers", (table) => {
    table.dropColumn("admin_id");
  });
}
