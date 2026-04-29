const nodemailer = require('nodemailer');
const { Resend } = require('resend');
const { BrevoClient } = require('@getbrevo/brevo');
const env = require('../config/env');
const logger = require('./logger');

// Initialize Brevo Client
const brevoClient = env.BREVO_API_KEY ? new BrevoClient({ apiKey: env.BREVO_API_KEY }) : null;

// Initialize Resend if key is available
const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

// Fallback SMTP Transporter
const transporter = nodemailer.createTransport({
  host: env.EMAIL_HOST,
  port: env.EMAIL_PORT,
  secure: env.EMAIL_PORT == 465,
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS,
  },
});

const sendEmail = async (options) => {
  try {
    // 1. Try Brevo first (User's preferred choice)
    if (brevoClient) {
      const data = await brevoClient.transactionalEmails.sendTransacEmail({
        subject: options.subject,
        htmlContent: options.html,
        sender: { email: env.EMAIL_FROM, name: env.EMAIL_FROM_NAME },
        to: [{ email: options.to }],
      });
      logger.info(`Email sent via Brevo: ${data.messageId || 'success'}`);
      return data;
    }

    // 2. Try Resend second
    if (resend) {
      const { data, error } = await resend.emails.send({
        from: `${env.EMAIL_FROM_NAME} <${env.EMAIL_FROM}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });

      if (!error) {
        logger.info(`Email sent via Resend: ${data.id}`);
        return data;
      }
      logger.error(`Resend error: ${error.message}`);
    }

    // 3. Fallback to SMTP
    const info = await transporter.sendMail({
      from: `"${env.EMAIL_FROM_NAME}" <${env.EMAIL_FROM}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    logger.info(`Email sent via SMTP: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error(`Email delivery failed: ${error.message}`);
    if (env.NODE_ENV === 'production') {
      throw error;
    }
  }
};

const sendUserConfirmation = async (booking) => {
  const dateStr = new Date(booking.date).toLocaleDateString('en-GB', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #1a1a2e; margin-bottom: 10px; font-size: 24px;">Booking Confirmed</h1>
        <p style="color: #64748b; font-size: 16px;">We're excited to see you at LuxeLoft Studio!</p>
      </div>
      
      <div style="background: #f1f5f9; padding: 25px; border-radius: 12px; margin-bottom: 25px;">
        <h2 style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #1a1a2e; margin-top: 0; font-weight: 600;">Session Details</h2>
        <div style="margin-top: 15px; color: #4b5563; font-size: 15px;">
          <p style="margin: 8px 0;"><strong>Date:</strong> ${dateStr}</p>
          <p style="margin: 8px 0;"><strong>Time Slot:</strong> ${booking.timeSlot}</p>
          <p style="margin: 8px 0;"><strong>Type:</strong> ${booking.sessionType || 'Studio Session'}</p>
        </div>
      </div>

      <div style="text-align: center; color: #9ca3af; font-size: 12px; border-top: 1px solid #e2e8f0; pt: 20px;">
        <p style="margin-top: 20px;">If you need to cancel or reschedule, please contact us at least 24 hours in advance.</p>
        <p>Lagos, Nigeria • +234 801 234 5678</p>
        <p style="color: #9ca3af; font-size: 11px; margin-top: 20px;">&copy; ${new Date().getFullYear()} LuxeLoft Studio</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: booking.email,
    subject: 'Booking Confirmed — LuxeLoft Studio',
    html,
  });
};

const sendAdminNotification = async (booking) => {
  const dateStr = new Date(booking.date).toLocaleDateString('en-GB', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
      <div style="background: #1a1a2e; color: white; padding: 20px; text-align: center; border-radius: 12px 12px 0 0;">
        <h1 style="margin: 0; font-size: 20px;">New Session Booked</h1>
      </div>
      
      <div style="padding: 25px; border: 1px solid #e2e8f0; border-top: 0; border-radius: 0 0 12px 12px;">
        <h2 style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #1a1a2e; margin-top: 0; font-weight: 600;">Client Information</h2>
        <div style="margin: 15px 0 25px 0; color: #4b5563; font-size: 14px;">
          <p style="margin: 8px 0;"><strong>Name:</strong> ${booking.name}</p>
          <p style="margin: 8px 0;"><strong>Email:</strong> ${booking.email}</p>
          <p style="margin: 8px 0;"><strong>Phone:</strong> ${booking.phone}</p>
        </div>

        <h2 style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #1a1a2e; margin-top: 0; font-weight: 600;">Session Details</h2>
        <div style="margin-top: 15px; color: #4b5563; font-size: 14px;">
          <p style="margin: 8px 0;"><strong>Date:</strong> ${dateStr}</p>
          <p style="margin: 8px 0;"><strong>Time Slot:</strong> ${booking.timeSlot}</p>
          <p style="margin: 8px 0;"><strong>Type:</strong> ${booking.sessionType || 'Not specified'}</p>
          ${booking.notes ? `<p style="margin: 8px 0;"><strong>Notes:</strong> ${booking.notes}</p>` : ''}
        </div>

        <div style="margin-top: 30px; text-align: center;">
          <a href="${env.FRONTEND_URL}/admin/bookings" style="background: #1a1a2e; color: white; padding: 12px 25px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">View in Dashboard</a>
        </div>
      </div>
      <div style="text-align: center; margin-top: 20px;">
        <p style="color: #9ca3af; font-size: 10px;">LuxeLoft Studio Admin Notification</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: env.ADMIN_NOTIFY_EMAIL,
    subject: `New Booking: ${booking.name} — LuxeLoft Studio`,
    html,
  });
};

const sendVerificationEmail = async (email, code) => {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #0a0a0a; color: #ffffff;">
      <h1 style="color: #ffffff; text-align: center; font-size: 24px; margin-top: 30px;">Verify your email</h1>
      <p style="color: #a3a3a3; font-size: 16px; text-align: center;">Welcome to LuxeLoft Studio. Please use the verification code below to complete your registration:</p>
      
      <div style="background: #1a1a2e; padding: 30px; text-align: center; border-radius: 12px; margin: 30px 0; border: 1px solid #f43f5e33;">
        <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #f43f5e;">${code}</span>
      </div>
      
      <p style="color: #525252; font-size: 14px; text-align: center;">This code will expire in 24 hours. If you didn't create an account, please ignore this email.</p>
      
      <div style="margin-top: 40px; border-top: 1px solid #262626; padding-top: 20px; text-align: center;">
        <p style="color: #525252; font-size: 12px;">&copy; ${new Date().getFullYear()} LuxeLoft Studio. All rights reserved.</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: 'Verify Your Email — LuxeLoft Studio',
    html,
  });
};

module.exports = {
  sendUserConfirmation,
  sendAdminNotification,
  sendVerificationEmail,
};
