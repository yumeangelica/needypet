const nodemailer = require('nodemailer');
const config = require('./config');

// Create Transporter For Outlook
const transporter = nodemailer.createTransport({
  host: config.emailService,
  port: config.emailPort,
  secure: false, // True for 465, false for other ports
  auth: {
    user: config.emailUser, // App email address
    pass: config.emailPass, // App email password
  },
});

// Function to send email
const sendMail = (to, subject, html) => {
  const mailOptions = {
    from: config.emailUser, // Sender's email address
    to, // Recipient's email address
    subject, // Email subject
    html, // Email content in HTML format
  };

  return transporter.sendMail(mailOptions);
};

const sendConfirmationEmail = async (recipientEmail, emailConfirmationToken) => {
  // URL for email confirmation
  const confirmationUrl = `${config.allowedOrigins}/confirm?confirmationType=email&email=${encodeURIComponent(recipientEmail)}&token=${emailConfirmationToken}`;

  const message = `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <h2>Welcome to Needypet!</h2>
    <p>Hi there,</p>
    <p>Thank you for joining Needypet, the best app to manage all your pet care needs. We're excited to have you on board!</p>
    <p>To get started, please confirm your email address by clicking the button below:</p>
    <p><a href="${confirmationUrl}" style="display: inline-block; padding: 10px 20px; font-size: 16px; color: white; background-color: #4CAF50; text-decoration: none; border-radius: 5px;">Confirm Email</a></p>
    <p>Once your email is confirmed, you'll be able to use the full application for your pet's needs.</p>
    <p>If you did not sign up for Needypet, please ignore this email.</p>
    <p>We look forward to helping you take the best care of your furry friends!</p>
    <p>Best regards,<br>The Needypet Team</p>
    <p style="font-size: 12px; color: #999;">Needypet - Your Pet Care Management App</p>
  </div>
`;

  try {
    await sendMail(recipientEmail, 'Please Confirm Your NeedyPet Email Address', message);
  } catch (error) {
    console.error('Error sending confirmation email to email: ', recipientEmail + ' Error: ' + error);
  }
};

const sendPasswordResetEmail = async (recipientEmail, passwordResetToken) => {
  const resetPasswordUrl = `${config.allowedOrigins}/confirm?confirmationType=password&email=${encodeURIComponent(recipientEmail)}&token=${passwordResetToken}`;

  const message = `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <h2>Reset Your Password</h2>
    <p>Hi there,</p>
    <p>It looks like you requested a password reset for your Needypet account. No worries, we've got you covered!</p>
    <p>To reset your password, please click the button below:</p>
    <p><a href="${resetPasswordUrl}" style="display: inline-block; padding: 10px 20px; font-size: 16px; color: white; background-color: #4CAF50; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
    <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
    <p>Best regards,<br>The Needypet Team</p>
    <p style="font-size: 12px; color: #999;">Needypet - Your Pet Care Management App</p>
  </div>`;

  try {
    await sendMail(recipientEmail, 'Reset Your NeedyPet Password', message);
  } catch (error) {
    console.error('Error sending password reset email to email: ', recipientEmail + ' Error: ' + error);
  }
};

module.exports = {
  sendConfirmationEmail,
  sendPasswordResetEmail,
};
