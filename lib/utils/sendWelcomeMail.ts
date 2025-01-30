import nodemailer from "nodemailer";

export async function sendWelcomeMail(email: string, name: string) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.NODE_MAILER_ID,
      pass: process.env.NODE_MAILER_SECRET, // Use environment variables for production
    },
  });

  const mailOptions = {
    from: process.env.NODE_MAILER_ID,
    to: email,
    subject: `Hurray!!! Welcome to Klassifies ${name}!`,
    html: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <title>Welcome to Klassifies</title>
    <style>
      body {
        font-family: 'Poppins', sans-serif;
        background-color: #f4f4f9;
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
      .content h1 {
        font-size: 28px;
        color: #1f2937;
      }
      .content p {
        margin: 10px 0;
        font-size: 16px;
        line-height: 1.5;
      }
      .button {
        display: inline-block;
        margin: 15px 10px;
        padding: 12px 20px;
        background: #1e3a8a;
        color: #ffffff;
        border-radius: 8px;
        text-decoration: none;
        font-size: 16px;
        font-weight: 500;
      }
      .footer {
        background: #f4f4f9;
        padding: 20px;
        font-size: 12px;
        color: #6b7280;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        Welcome to Klassifies! 🚀
      </div>
      <div class="content">
        <h1>Hi [Name],</h1>
        <p>Welcome to Klassifies – we're thrilled to have you on board! 🎉</p>
        <p>
          Whether you're here to buy, sell, or explore, you've joined a community
          that makes finding what you need easy and convenient.
        </p>
        <p>Here’s how you can get started:</p>
        <a href="#" class="button">Post Your First Ad</a>
        <a href="#" class="button">Browse Listings</a>
        <a href="#" class="button">Update Your Profile</a>
        <p>
          If you have any questions or need assistance, our support team is just
          an email away.
        </p>
      </div>
      <div class="footer">
        Happy exploring,<br />
        The Klassifies Team
      </div>
    </div>
  </body>
</html>


`,
  };

  await transporter.sendMail(mailOptions);
}
