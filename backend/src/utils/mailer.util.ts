import * as nodemailer from 'nodemailer';

export const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: 'amya.koss2@ethereal.email',
      pass: 'tVqwvMMW7dfc2xPwAw',
    },
  });

  const mailOptions = {
    from: 'no-reply@example.com',
    to: options.email,
    subject: options.subject,
    text: options.text,
    html: options.html,
  };
  await transporter.sendMail(mailOptions);
};
