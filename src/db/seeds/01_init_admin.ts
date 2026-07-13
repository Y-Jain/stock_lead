import { Knex } from "knex";
import * as argon2 from "argon2";
import crypto from "crypto";

export async function seed(knex: Knex): Promise<void> {
  const passwordHash = await argon2.hash("password");
  
  // Create admin role if it doesn't exist
  let adminRole = await knex("roles").where("name", "admin").first();
  if (!adminRole) {
    const roleId = crypto.randomUUID();
    await knex("roles").insert({ id: roleId, name: "admin" });
    adminRole = { id: roleId };
  }

  // Create manager role if it doesn't exist
  let managerRole = await knex("roles").where("name", "manager").first();
  if (!managerRole) {
    const roleId = crypto.randomUUID();
    await knex("roles").insert({ id: roleId, name: "manager" });
  }

  // Check if admin user already exists
  const existingAdmin = await knex("users").where("email", "admin@admin.com").first();
  if (!existingAdmin) {
    // Create admin user
    const userId = crypto.randomUUID();
    await knex("users").insert({
      id: userId,
      email: "admin@admin.com",
      password_hash: passwordHash,
      role_id: adminRole.id,
      is_active: true,
      created_at: new Date()
    });
  }
}
