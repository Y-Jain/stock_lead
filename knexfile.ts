import type { Knex } from "knex";
import dotenv from "dotenv";

// dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" }); // Fallback to .env if .env.local doesn't define it

const dbUrl = process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/lead_crm";
// Automatically enable SSL for Neon and other hosted databases
const isNeon = dbUrl.includes("neon.tech");
const isProd = process.env.NODE_ENV === "production";

const connectionConfig = (isNeon || isProd)
  ? { connectionString: dbUrl, ssl: { rejectUnauthorized: false } }
  : dbUrl;

const config: { [key: string]: Knex.Config } = {
  development: {
    client: "postgresql",
    connection: connectionConfig,
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: "knex_migrations",
      directory: "./src/db/migrations"
    },
    seeds: {
      directory: "./src/db/seeds"
    }
  },

  production: {
    client: "postgresql",
    connection: connectionConfig,
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: "knex_migrations",
      directory: "./src/db/migrations"
    }
  }
};

export default config;
