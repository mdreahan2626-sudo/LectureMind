require('dotenv').config();
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

async function testEmail() {
  console.log("Testing Resend API Key:", process.env.RESEND_API_KEY ? "Present (length: " + process.env.RESEND_API_KEY.length + ")" : "Missing");
  
  try {
    const data = await resend.emails.send({
      from: "LectureMind AI <onboarding@resend.dev>",
      to: "rehan98178@gmail.com", // user's actual email
      subject: "Resend Direct Test - OTP Code",
      html: "<p>If you receive this, your Resend API Key is working perfectly!</p>"
    });
    
    console.log("Email request sent successfully!");
    console.log("Response data:", data);
  } catch (error) {
    console.error("Resend execution error:");
    console.error(error);
  }
}

testEmail();
