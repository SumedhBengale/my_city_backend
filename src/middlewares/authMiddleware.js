// authMiddleware.js
const passport = require('passport');
const axios = require('axios');
const nodemailer = require('nodemailer');

const requireAuth = passport.authenticate('jwt', { session: false, });


const verifyEmail = (userName, email, verificationToken) => {
  const verificationLink = `${process.env.AWS_URL}verify-email/${verificationToken}`;

  // Create a transporter object using the provided SMTP settings
  const transporter = nodemailer.createTransport({
    host: 'smtp.office365.com',
    port: 587,
    requireTLS: true,
    auth: {
      user: process.env.EMAIL, // Your email address
      pass: process.env.PASSWORD // Your email password or an application-specific password
    }
  });

  // Email content
  const mailOptions = {
    from: process.env.EMAIL, // Sender address
    to: `<${email}>`, // Recipient's name and email
    subject: 'Verification Email',
    html: `
      <p>Hello ${userName},</p>
      <p>Please click the following link to verify your email:</p>
      <p><a href="${verificationLink}">${verificationLink}</a></p>
      <p>Best regards,</p>
      <p>My City Residences</p>
    `
  };
  console.log(mailOptions)

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
};

//Forget Password
const resetPassword = (email, passwordToken) => {
  const passwordLink = `${process.env.AWS_URL}reset-password/${passwordToken}`;

  // Create a transporter object using the provided SMTP settings
  const transporter = nodemailer.createTransport({
    host: 'smtp.office365.com',
    port: 587,
    requireTLS: true,
    auth: {
      user: process.env.EMAIL, // Your email address
      pass: process.env.PASSWORD // Your email password or an application-specific password
    }
  });

  // Email content
  const mailOptions = {
    from: process.env.EMAIL, // Sender address
    to: `<${email}>`, // Recipient's name and email
    subject: 'Reset Password',
    html: `
      <p>Hello ${email},</p>
      <p>Please click the following link to reset your password:</p>
      <p><a href="${passwordLink}">${passwordLink}</a></p>
      <p>Best regards,</p>
      <p>My City Residences</p>
    `
  };
  console.log(mailOptions)

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
}


module.exports = { requireAuth, verifyEmail, resetPassword };
