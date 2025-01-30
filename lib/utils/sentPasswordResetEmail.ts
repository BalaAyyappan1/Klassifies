import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.NODE_MAILER_ID,
    pass: process.env.NODE_MAILER_SECRET, 
  },
});

export default async function sendPasswordResetEmail(email:string, token:string) {
  const resetPasswordURL = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/reset-password?token=${token}`;
  const mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: email,
    subject: "Klassifies: Password Reset Request",
    html: `
      <p>Dear User,</p>
      <p>We received a request to reset the password for your Spotlight account.</p>
      <p>Please click the link below to reset your password:</p>
      <p>
        <a href="${resetPasswordURL}" style="color: #4F8AFF; text-decoration: none;">
          <strong>Reset Your Password</strong>
        </a>
      </p>
      <p>If you did not request a password reset, please disregard this email. Your account security is important to us, and no changes will be made without your confirmation.</p>
      <p>Thank you,<br>The Spotlight Team</p>
    `,
  };

  await transporter.sendMail(mailOptions);
}
