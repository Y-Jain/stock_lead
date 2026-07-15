import { NextResponse } from "next/server";
import db from "@/db";
import * as argon2 from "argon2";
import { loginLimiter } from "@/lib/rate-limit";
import { z } from "zod";

const resetSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6, "OTP must be exactly 6 digits"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(request: Request) {
  try {
    const ip_address = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "Unknown";
    
    if (!loginLimiter.check(ip_address)) {
      return NextResponse.json({ error: "Too many requests, try again later." }, { status: 429 });
    }

    const body = await request.json();
    const parsedData = resetSchema.safeParse(body);
    
    if (!parsedData.success) {
      return NextResponse.json({ error: parsedData.error.errors[0].message }, { status: 400 });
    }

    const { email, otp, newPassword } = parsedData.data;

    const user = await db("users").where({ email }).first();

    if (!user) {
      return NextResponse.json({ error: "Invalid OTP or Email" }, { status: 400 });
    }

    if (user.reset_otp !== otp) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    if (!user.reset_otp_expires_at || new Date(user.reset_otp_expires_at) < new Date()) {
      return NextResponse.json({ error: "OTP has expired. Please request a new one." }, { status: 400 });
    }

    const passwordHash = await argon2.hash(newPassword);

    await db("users").where({ id: user.id }).update({
      password_hash: passwordHash,
      reset_otp: null,
      reset_otp_expires_at: null
    });

    return NextResponse.json({ success: true, message: "Password has been successfully reset." });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Failed to reset password" }, { status: 500 });
  }
}
