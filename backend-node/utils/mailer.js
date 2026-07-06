const nodemailer = require('nodemailer');

const host = process.env.SMTP_HOST || 'smtp.gmail.com';
const port = parseInt(process.env.SMTP_PORT || '587', 10);
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const from = process.env.SMTP_FROM || 'LectureMind AI <noreply@lecturemind.com>';

let transporter = null;
const isSmtpConfigured = user && pass;

if (isSmtpConfigured) {
  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for port 465, false for other ports (587, 25)
    auth: {
      user,
      pass,
    },
  });
  console.log(`[Nodemailer] Direct SMTP transporter configured successfully for host: ${host}`);
} else {
  console.log(`[Nodemailer] SMTP credentials missing in .env. Using Console Fallback mode for local testing.`);
}

/**
 * Send Verification OTP
 */
async function sendVerificationOtp(email, otp) {
  const subject = "Verify your email for LectureMind AI - OTP Code";
  const htmlContent = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #2563eb; text-align: center;">Welcome to LectureMind AI!</h2>
      <p>Thank you for signing up. Here is your 6-digit OTP verification code to activate your account:</p>
      
      <div style="margin: 28px 0; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #2563eb; text-align: center; background-color: #f8fafc; padding: 20px; border-radius: 12px; border: 1px dashed #cbd5e1;">
        ${otp}
      </div>
      
      <p>Please enter this code on the website verification panel to verify your email address and activate your account.</p>
      <p style="font-size: 12px; color: #64748b; margin-top: 24px;">Note: This verification OTP code is only valid for 10 minutes.</p>
    </div>
  `;

  if (isSmtpConfigured && transporter) {
    try {
      await transporter.sendMail({
        from,
        to: email,
        subject,
        html: htmlContent,
      });
      console.log(`[Nodemailer] Verification OTP successfully sent via SMTP to: ${email}`);
      return { success: true };
    } catch (error) {
      console.error(`[Nodemailer Error] SMTP delivery failed to ${email}. Falling back to console output:`, error.message);
      logOtpFallback(email, otp);
      return { success: false, error: error.message };
    }
  } else {
    logOtpFallback(email, otp);
    return { success: true, fallback: true };
  }
}

/**
 * Send Forgot Password Link
 */
async function sendForgotPasswordLink(email, token) {
  const resetUrl = `http://localhost:5173/reset-password?token=${token}`;
  const subject = "Reset your LectureMind AI password";
  const htmlContent = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #4f46e5;">Reset Your Password</h2>
      <p>You requested a password reset for your LectureMind AI account. Please click the button below to set a new password.</p>
      <div style="margin: 24px 0;">
        <a href="${resetUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">Reset Password</a>
      </div>
      <p>This password reset link is valid for 1 hour.</p>
      <p style="font-size: 12px; color: #64748b;">If you did not request this, you can safely ignore this email.</p>
    </div>
  `;

  if (isSmtpConfigured && transporter) {
    try {
      await transporter.sendMail({
        from,
        to: email,
        subject,
        html: htmlContent,
      });
      console.log(`[Nodemailer] Reset link successfully sent via SMTP to: ${email}`);
      return { success: true };
    } catch (error) {
      console.error(`[Nodemailer Error] SMTP password reset failed to ${email}. Falling back to console output:`, error.message);
      logResetFallback(email, resetUrl);
      return { success: false, error: error.message };
    }
  } else {
    logResetFallback(email, resetUrl);
    return { success: true, fallback: true };
  }
}

function logOtpFallback(email, otp) {
  console.log(`\n======================================================`);
  console.log(`[SMTP FALLBACK] OTP Code generated for ${email}:`);
  console.log(`CODE: ${otp}`);
  console.log(`======================================================\n`);
}

function logResetFallback(email, url) {
  console.log(`\n======================================================`);
  console.log(`[SMTP FALLBACK] Password Reset URL generated for ${email}:`);
  console.log(`LINK: ${url}`);
  console.log(`======================================================\n`);
}

module.exports = {
  sendVerificationOtp,
  sendForgotPasswordLink,
};
