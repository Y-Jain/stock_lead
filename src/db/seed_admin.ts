import db from "./index";
import * as argon2 from "argon2";
import crypto from "crypto";

async function seed() {
  try {
    const passwordHash = await argon2.hash("password");
    
    // Create admin role if it doesn't exist
    let adminRole = await db("roles").where("name", "admin").first();
    if (!adminRole) {
      const roleId = crypto.randomUUID();
      await db("roles").insert({ id: roleId, name: "admin" });
      adminRole = { id: roleId };
    }

    // Create manager role if it doesn't exist
    let managerRole = await db("roles").where("name", "manager").first();
    if (!managerRole) {
      const roleId = crypto.randomUUID();
      await db("roles").insert({ id: roleId, name: "manager" });
    }

    // Check if admin user already exists
    const existingAdmin = await db("users").where("email", "admin@admin.com").first();
    if (existingAdmin) {
      console.log("Admin user already exists. Email: admin@admin.com / Password: password");
      process.exit(0);
    }

    // Create admin user
    const userId = crypto.randomUUID();
    await db("users").insert({
      id: userId,
      email: "admin@admin.com",
      password_hash: passwordHash,
      role_id: adminRole.id,
      is_active: true
    });

    console.log("Admin user seeded successfully: admin@admin.com / password");
    process.exit(0);
  } catch (err) {
    console.error("Error seeding database:", err);
    process.exit(1);
  }
}

seed();
