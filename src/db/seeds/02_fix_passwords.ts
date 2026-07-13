import { Knex } from "knex";
import * as argon2 from "argon2";

export async function seed(knex: Knex): Promise<void> {
  const hash = await argon2.hash("password");
  const count = await knex("users").where("password_hash", "mocked_hash_for_now").update({ password_hash: hash });
  console.log(`Fixed ${count} old manager passwords. Their password is now 'password'`);
}
