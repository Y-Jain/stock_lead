import { NextResponse } from "next/server";
import db from "@/db";
import nodemailer from "nodemailer";
import { loginLimiter } from "@/lib/rate-limit"; // reuse login limiter to prevent spam

export async function POST(request: Request) {
  try {
    const ip_address = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "Unknown";
    
    if (!loginLimiter.check(ip_address)) {
      return NextResponse.json({ error: "Too many requests, try again later." }, { status: 429 });
    }

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await db("users").where({ email }).first();

    if (!user) {
      // Prevent email enumeration
      return NextResponse.json({ success: true, message: "If an account exists, an OTP has been sent." });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await db("users").where({ id: user.id }).update({
      reset_otp: otp,
      reset_otp_expires_at: expiresAt
    });

    // Send email
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: Number(process.env.SMTP_PORT) || 587,
      auth: {
        user: process.env.SMTP_USER || 'test',
        pass: process.env.SMTP_PASS || 'test'
      }
    });

    // Log the OTP securely to the console for testing since SMTP isn't configured by default
    console.log(`\n\n==============================================`);
    console.log(`🔒 PASSWORD RESET OTP FOR ${email}: ${otp}`);
    console.log(`==============================================\n\n`);

    try {
      if (process.env.SMTP_HOST) {
        await transporter.sendMail({
          from: '"Lead CRM" <noreply@crm.company.com>',
          to: email,
          subject: "Password Reset OTP",
          text: `Your password reset OTP is: ${otp}. It expires in 10 minutes.`,
          html: `<p>Your password reset OTP is: <b>${otp}</b></p><p>It expires in 10 minutes.</p>`
        });
      }
    } catch (mailErr) {
      console.error("Failed to send email via SMTP, but OTP was logged to console.", mailErr);
    }

    return NextResponse.json({ success: true, message: "If an account exists, an OTP has been sent." });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
