import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Resend } from "resend";
import crypto from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email address is required" },
        { status: 400 }
      );
    }

    const emailStr = String(email).toLowerCase();

    // Generate a secure 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // Set expiration to 10 minutes from now
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    // Upsert the token in the VerificationToken table
    // (Wait, VerificationToken uses composite unique on [identifier, token],
    // so we can just delete any existing ones for this email and create a new one,
    // or use prisma.verificationToken.deleteMany)
    await db.verificationToken.deleteMany({
      where: { identifier: emailStr }
    });

    await db.verificationToken.create({
      data: {
        identifier: emailStr,
        token: otp,
        expires
      }
    });

    // Send the email using Resend
    const { data, error } = await resend.emails.send({
      from: "POUR <onboarding@resend.dev>",
      to: [emailStr],
      subject: "Your POUR Login Code",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Sign in to POUR</h2>
          <p>Your one-time login code is:</p>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; border-radius: 8px;">
            ${otp}
          </div>
          <p style="color: #666; font-size: 14px;">This code will expire in 10 minutes.</p>
          <p style="color: #666; font-size: 14px;">If you didn't request this code, you can safely ignore this email.</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend Error:", error);
      return NextResponse.json(
        { error: "Failed to send email. Please try again later." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("OTP Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
