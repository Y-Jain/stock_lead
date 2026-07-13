import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // Roles table
  await knex.schema.createTable("roles", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.string("name").notNullable().unique();
    table.timestamps(true, true);
  });

  // Users table
  await knex.schema.createTable("users", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.string("email").notNullable().unique();
    table.string("password_hash").notNullable();
    table.uuid("role_id").references("id").inTable("roles").onDelete("SET NULL");
    table.boolean("is_active").defaultTo(true);
    table.timestamp("last_login");
    table.timestamps(true, true);
  });

  // Managers table
  await knex.schema.createTable("managers", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.uuid("user_id").references("id").inTable("users").onDelete("CASCADE");
    table.string("employee_id").unique();
    table.string("phone");
    table.string("department");
    table.string("tracker_id").notNullable().unique();
    table.string("form_url").notNullable().unique();
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("managers");
  await knex.schema.dropTableIfExists("users");
  await knex.schema.dropTableIfExists("roles");
}
