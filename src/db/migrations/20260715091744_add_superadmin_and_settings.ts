import type { Knex } from "knex";
import * as argon2 from "argon2";
import crypto from "crypto";

export async function up(knex: Knex): Promise<void> {
  // 1. Create settings table
  await knex.schema.createTable("settings", (table) => {
    table.string("key").primary();
    table.text("value");
    table.timestamps(true, true);
  });

  // 2. Insert default settings
  await knex("settings").insert({
    key: "logo_url",
    value: "/logo.png"
  });

  // 3. Create superadmin role
  const roleId = crypto.randomUUID();
  await knex("roles").insert({ id: roleId, name: "superadmin" });

  // 4. Create superadmin user
  const passwordHash = await argon2.hash("password");
  const userId = crypto.randomUUID();
  await knex("users").insert({
    id: userId,
    email: "superadmin@admin.com",
    password_hash: passwordHash,
    role_id: roleId,
    is_active: true
  });
}

export async function down(knex: Knex): Promise<void> {
  // Remove superadmin user
  await knex("users").where("email", "superadmin@admin.com").del();
  // Remove superadmin role
  await knex("roles").where("name", "superadmin").del();
  // Drop settings table
  await knex.schema.dropTableIfExists("settings");
}
