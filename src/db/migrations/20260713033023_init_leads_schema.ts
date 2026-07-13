import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // Leads table
  await knex.schema.createTable("leads", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.uuid("manager_id").references("id").inTable("managers").onDelete("CASCADE");
    table.uuid("form_id").references("id").inTable("forms").onDelete("CASCADE");
    
    table.string("status").defaultTo("New"); // New, Called, Interested, Converted, Lost
    table.string("priority").defaultTo("Medium"); // Low, Medium, High
    table.string("ip_address");
    table.string("user_agent");
    
    // The actual form submission answers stored as JSON
    table.jsonb("custom_data").notNullable();
    
    // Optimistic locking column
    table.integer("version").defaultTo(1).notNullable();
    
    table.timestamps(true, true);
  });

  // Lead Notes table
  await knex.schema.createTable("lead_notes", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.uuid("lead_id").references("id").inTable("leads").onDelete("CASCADE");
    table.uuid("author_id").references("id").inTable("users").onDelete("CASCADE");
    table.text("content").notNullable();
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("lead_notes");
  await knex.schema.dropTableIfExists("leads");
}
