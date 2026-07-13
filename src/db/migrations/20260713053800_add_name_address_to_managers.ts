import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("managers", (table) => {
    table.string("name");
    table.text("address");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("managers", (table) => {
    table.dropColumn("name");
    table.dropColumn("address");
  });
}
