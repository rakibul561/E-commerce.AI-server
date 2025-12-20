/* eslint-disable @typescript-eslint/no-explicit-any */
import nodemailer from "nodemailer";
import path from "path";
import ejs from "ejs";
import fs from "fs";
import config from "../config";

export interface IEmailOptions {
  to: string;
  subject: string;
  templateName?: string;
  templateData?: Record<string, any>;
  html?: string;
  text?: string;
}

const transporter = nodemailer.createTransport({
  host: config.nodeMiller.email_host,
  port: Number(config.nodeMiller.email_port),
  secure: false,
  auth: {
    user: config.nodeMiller.email_user,
    pass: config.nodeMiller.email_pass,
  },
});

export const sendEmail = async (options: IEmailOptions) => {
  let html = options.html;

  // ✅ TEMPLATE RENDERING
  if (options.templateName) {
    const templatePath = path.join(
      __dirname,
      "../templates",
      `${options.templateName}.ejs`
    );

    const template = fs.readFileSync(templatePath, "utf-8");
    html = ejs.render(template, options.templateData || {});
  }

  if (!html) {
    throw new Error("Email html content is missing");
  }

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: options.to,
    subject: options.subject,
    html,
    text: options.text,
  });
};
