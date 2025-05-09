import nodemailer from "nodemailer";

export async function sendEmailOtp(email: string, otp: string, name: string) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.NODE_MAILER_ID,
      pass: process.env.NODE_MAILER_SECRET,
    },
  });

  const mailOptions = {
    from: process.env.NODE_MAILER_ID,
    to: email,
    subject: "Your Klassifies Login OTP",
    html: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <title>Klassifies OTP Email</title>
    <style>
      body {
        font-family: 'Poppins', sans-serif;
        background: #f4f4f9;
        margin: 0;
        padding: 0;
        color: #1f2937;
      }
      .container {
        max-width: 600px;
        margin: 50px auto;
        background: #ffffff;
        border-radius: 15px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        overflow: hidden;
        padding: 20px;
        text-align: center;
      }
      .header {
        background: #1e3a8a;
        color: #ffffff;
        padding: 20px;
        font-size: 24px;
        font-weight: 600;
      }
      .content {
        padding: 30px 20px;
      }
      .otp {
        font-size: 36px;
        font-weight: bold;
        color: #ba3d4f;
        margin: 20px 0;
        letter-spacing: 5px;
      }
      .button {
        display: inline-block;
        background: #1e3a8a;
        color: #ffffff;
        padding: 10px 20px;
        border-radius: 8px;
        text-decoration: none;
        font-size: 16px;
        margin-top: 20px;
      }
      .footer {
        margin-top: 30px;
        font-size: 12px;
        color: #6b7280;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">Your Klassifies Login OTP</div>
      <div class="content">
        <p>Hi <strong>${name}</strong>,</p>
        <p>Your One-Time Password (OTP) for logging into Klassifies is:</p>
        <div class="otp">${otp}</div>
        <p>
          This OTP is valid for the next <strong>5 minutes</strong>.
          Please do not share it with anyone for security reasons.
        </p>
      </div>
      <div class="footer">
       <p>If you didn’t request this OTP, please ignore this email or contact our support team immediately.</p>
  <p>Need help? <a href="https://klassifies.com/Footer/contact" style="color: #1e3a8a; text-decoration: underline;">Contact Us</a></p>
  <p>Thank you for using Klassifies!</p>
  <p>Best regards,<br />The Klassifies Team</p>
      </div>
    </div>
  </body>
</html>`,
  };

  await transporter.sendMail(mailOptions);
}
