require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER || "adminservease@gmail.com",
    pass: process.env.GMAIL_PASS,
  },
});

// OTP Email
const sendOtpEmail = async (toEmail, fullName, otp) => {
  const mailOptions = {
    from: `"ServEase" <${process.env.GMAIL_USER || "adminservease@gmail.com"}>`,
    to: toEmail,
    subject: "ServEase — Email Verification Code",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;padding:30px;border:1px solid #EDD9C8;border-radius:12px;background:#FFF8EF;">
        <h2 style="color:#E8845A;text-align:center;">ServEase</h2>
        <p style="color:#2D2A24;">Hi <strong>${fullName}</strong>,</p>
        <p style="color:#2D2A24;">Use this OTP to verify your email. Valid for <strong>10 minutes</strong>.</p>
        <div style="text-align:center;margin:30px 0;">
          <span style="font-size:36px;font-weight:bold;letter-spacing:10px;color:#E8845A;background:#FFF2E6;padding:15px 25px;border-radius:8px;">${otp}</span>
        </div>
        <p style="color:#9A8878;font-size:12px;">If you did not request this, ignore this email.</p>
        <hr style="border-color:#EDD9C8;">
        <p style="color:#9A8878;font-size:11px;text-align:center;">© ServEase — Pakistan Home Services</p>
      </div>
    `,
  };
  await transporter.sendMail(mailOptions);
};

// Reset Password Email
const sendResetEmail = async (toEmail, fullName, resetToken, role) => {
  const resetUrl = `${process.env.FRONTEND_URL || "http://serveease.sandbox.pk"}/api/auth/reset-redirect?token=${resetToken}&role=${role}`;
  const mailOptions = {
    from: `"ServEase" <${process.env.GMAIL_USER || "adminservease@gmail.com"}>`,
    to: toEmail,
    subject: "ServEase — Password Reset Request",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;padding:30px;border:1px solid #EDD9C8;border-radius:12px;background:#FFF8EF;">
        <h2 style="color:#E8845A;text-align:center;">ServEase</h2>
        <p style="color:#2D2A24;">Hi <strong>${fullName}</strong>,</p>
        <p style="color:#2D2A24;">Click below to reset your password. Link valid for <strong>30 minutes</strong>.</p>
        <div style="text-align:center;margin:30px 0;">
          <a href="${resetUrl}" style="background:#E8845A;color:white;padding:14px 30px;border-radius:8px;text-decoration:none;font-size:16px;font-weight:bold;">Reset Password</a>
        </div>
        <p style="color:#9A8878;font-size:12px;">Or copy: <a href="${resetUrl}">${resetUrl}</a></p>
        <p style="color:#9A8878;font-size:12px;">If you did not request this, ignore this email.</p>
        <hr style="border-color:#EDD9C8;">
        <p style="color:#9A8878;font-size:11px;text-align:center;">© ServEase — Pakistan Home Services</p>
      </div>
    `,
  };
  await transporter.sendMail(mailOptions);
};

// Service Request Approval Email
const sendApprovalEmail = async (toEmail, fullName, serviceName) => {
  const mailOptions = {
    from: `"ServEase" <${process.env.GMAIL_USER || "adminservease@gmail.com"}>`,
    to: toEmail,
    subject: "ServEase — Service Request Approved! 🎉",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;padding:30px;border:1px solid #EDD9C8;border-radius:12px;background:#FFF8EF;">
        <h2 style="color:#E8845A;text-align:center;">ServEase</h2>
        <p style="color:#2D2A24;">Hi <strong>${fullName}</strong>,</p>
        <p style="color:#2D2A24;">Great news! Your request to add the service <strong>"${serviceName}"</strong> has been reviewed and <strong>APPROVED</strong> by the admin. This service is now active on the platform.</p>
        <p style="color:#2D2A24;">You can now accept jobs and offer this service to customers.</p>
        <hr style="border-color:#EDD9C8; margin: 20px 0;">
        <p style="color:#9A8878;font-size:11px;text-align:center;">© ServEase — Pakistan Home Services</p>
      </div>
    `,
  };
  await transporter.sendMail(mailOptions);
};

// Service Request Rejection Email
const sendRejectionEmail = async (toEmail, fullName, serviceName, adminNote) => {
  const mailOptions = {
    from: `"ServEase" <${process.env.GMAIL_USER || "adminservease@gmail.com"}>`,
    to: toEmail,
    subject: "ServEase — Service Request Update",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;padding:30px;border:1px solid #EDD9C8;border-radius:12px;background:#FFF8EF;">
        <h2 style="color:#E8845A;text-align:center;">ServEase</h2>
        <p style="color:#2D2A24;">Hi <strong>${fullName}</strong>,</p>
        <p style="color:#2D2A24;">Your request to add the service <strong>"${serviceName}"</strong> has been reviewed.</p>
        <p style="color:#2D2A24;color:#D9534F;"><strong>Status: Rejected</strong></p>
        ${adminNote ? `<p style="color:#2D2A24;"><strong>Reason/Note from Admin:</strong> ${adminNote}</p>` : ''}
        <p style="color:#2D2A24;">If you have any questions, please reply to this email or contact support.</p>
        <hr style="border-color:#EDD9C8; margin: 20px 0;">
        <p style="color:#9A8878;font-size:11px;text-align:center;">© ServEase — Pakistan Home Services</p>
      </div>
    `,
  };
  await transporter.sendMail(mailOptions);
};

module.exports = { sendOtpEmail, sendResetEmail, sendApprovalEmail, sendRejectionEmail };