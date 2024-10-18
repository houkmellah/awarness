const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  console.log("Options ============>", options)
  let transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false, // Utiliser TLS
    auth: {
      user: process.env.BREVO_SMTP_USER,
      pass: process.env.BREVO_SMTP_PASSWORD,
    },
  });

  let info = await transporter.sendMail({
    from: `"Votre Nom" <${process.env.EMAIL_FROM}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  });

  console.log("Message sent: %s", info.messageId);
};

module.exports = sendEmail;