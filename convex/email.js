"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import nodemailer from "nodemailer";

// Action to send email using Nodemailer (Gmail SMTP)
export const sendEmail = action({
  args: {
    to: v.string(),
    subject: v.string(),
    html: v.string(),
    text: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = process.env.GMAIL_USER;
    const pass = process.env.GMAIL_APP_PASSWORD;

    if (!user || !pass) {
      console.error("Gmail credentials missing (GMAIL_USER or GMAIL_APP_PASSWORD).");
      return {
        success: false,
        error: "Missing GMAIL_USER or GMAIL_APP_PASSWORD in environment variables",
      };
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user,
        pass,
      },
    });

    try {
      const info = await transporter.sendMail({
        from: `Splitr <${user}>`,
        to: args.to,
        subject: args.subject,
        html: args.html,
        text: args.text,
      });

      console.log("Email sent successfully:", info.messageId);

      return { success: true, id: info.messageId };
    } catch (error) {
      console.error("Failed to send email via Nodemailer:", error);
      return { success: false, error: error.message };
    }
  },
});

