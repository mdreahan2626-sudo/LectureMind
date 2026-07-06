const { inngest } = require("./client");
const { Resend } = require("resend");

// Initialize Resend
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const sendVerificationEmail = inngest.createFunction(
  { id: "send-verification-email", event: "app/user.signup" },
  async ({ event, step }) => {
    const { email, token } = event.data; // token is the 6-digit OTP code
    
    console.log(`[Inngest Background] Verification OTP code generated for ${email}: ${token}`);
    
    if (resend) {
      await step.run("send-email", async () => {
        return await resend.emails.send({
          from: "LectureMind AI <onboarding@resend.dev>",
          to: email,
          subject: "Verify your email for LectureMind AI - OTP Code",
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
              <h2 style="color: #2563eb; text-align: center;">Welcome to LectureMind AI!</h2>
              <p>Thank you for signing up. Here is your 6-digit OTP verification code to activate your account:</p>
              
              <div style="margin: 28px 0; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #2563eb; text-align: center; background-color: #f8fafc; padding: 20px; border-radius: 12px; border: 1px dashed #cbd5e1;">
                ${token}
              </div>
              
              <p>Please enter this code on the website verification panel to verify your email address and activate your account.</p>
              <p style="font-size: 12px; color: #64748b; margin-top: 24px;">Note: This verification OTP code is only valid for 10 minutes. If you did not request this, you can safely ignore this email.</p>
            </div>
          `
        });
      });
    }
  }
);

const sendForgotPasswordEmail = inngest.createFunction(
  { id: "send-forgot-password-email", event: "app/user.forgot_password" },
  async ({ event, step }) => {
    const { email, token } = event.data;
    const resetUrl = `http://localhost:5173/reset-password?token=${token}`;
    
    console.log(`[Inngest Background] Reset link generated for ${email}: ${resetUrl}`);
    
    if (resend) {
      await step.run("send-email", async () => {
        return await resend.emails.send({
          from: "LectureMind AI <onboarding@resend.dev>",
          to: email,
          subject: "Reset your LectureMind AI password",
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
              <h2 style="color: #4f46e5;">Reset Your Password</h2>
              <p>You requested a password reset for your LectureMind AI account. Please click the button below to set a new password.</p>
              <div style="margin: 24px 0;">
                <a href="${resetUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">Reset Password</a>
              </div>
              <p>This password reset link is valid for 1 hour.</p>
              <p style="font-size: 12px; color: #64748b;">If you did not request this, you can safely ignore this email.</p>
            </div>
          `
        });
      });
    }
  }
);

module.exports = { sendVerificationEmail, sendForgotPasswordEmail };
