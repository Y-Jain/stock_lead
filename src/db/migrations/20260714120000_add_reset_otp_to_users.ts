import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("users", (table) => {
    table.string("reset_otp");
    table.timestamp("reset_otp_expires_at");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("users", (table) => {
    table.dropColumn("reset_otp");
    table.dropColumn("reset_otp_expires_at");
  });
}
