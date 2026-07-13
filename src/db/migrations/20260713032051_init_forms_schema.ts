import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // Forms table
  await knex.schema.createTable("forms", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.string("title").notNullable();
    table.text("description");
    table.string("submit_btn_text").defaultTo("Submit");
    table.string("success_message").defaultTo("Thank you for your submission!");
    table.string("redirect_url");
    table.boolean("is_active").defaultTo(true);
    table.timestamps(true, true);
  });

  // Form Fields table
  await knex.schema.createTable("form_fields", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.uuid("form_id").references("id").inTable("forms").onDelete("CASCADE");
    table.string("type").notNullable(); // e.g., 'text', 'email', 'number', 'dropdown'
    table.string("name").notNullable(); // programmatic name
    table.string("label").notNullable(); // display label
    table.string("placeholder");
    table.boolean("is_required").defaultTo(false);
    table.jsonb("validation_rules"); // e.g., { min: 0, max: 100, regex: '...' }
    table.integer("display_order").notNullable().defaultTo(0);
    table.timestamps(true, true);
  });

  // Form Assignments table
  await knex.schema.createTable("form_assignments", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.uuid("form_id").references("id").inTable("forms").onDelete("CASCADE");
    table.uuid("manager_id").references("id").inTable("managers").onDelete("CASCADE");
    table.timestamps(true, true);
    
    // Ensure a manager can only be assigned to the same form once
    table.unique(["form_id", "manager_id"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("form_assignments");
  await knex.schema.dropTableIfExists("form_fields");
  await knex.schema.dropTableIfExists("forms");
}
