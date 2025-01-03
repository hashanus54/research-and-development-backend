const nodemailer = require('nodemailer');

// Configure Nodemailer SMTP transport
const transporter = nodemailer.createTransport({
    host: 'smtp.sendgrid.net', // SendGrid's SMTP server
    port: 587, // Port for SMTP
    auth: {
        user: 'apikey', // Use 'apikey' as the username for SendGrid SMTP
        pass: process.env.SENDGRID_API_KEY, // Your SendGrid API Key as the password
    },
});

const appName = process.env.APPLICATION_NAME;

// Function to send OTP Email
const sendOTPEmail = async (user, otp) => {
    try {
        if (!user || !user.email) {
            throw new Error('Invalid user object or email is missing.');
        }
        if (!otp) {
            throw new Error('OTP is missing.');
        }

        const mailOptions = {
            from: process.env.SENDGRID_FROM_EMAIL, // From email (e.g., no-reply@yourdomain.com)
            to: user.email, // Recipient email
            subject: 'Account Verification',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1>Account Verification</h1>
                    <p>Hello ${user.firstName} ${user.lastName},</p>
                    <p>Thank you for signing up. Please use the following OTP to verify your account:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 4px; 
                                    font-size: 24px; font-weight: bold; letter-spacing: 5px;">
                            ${otp}
                        </div>
                    </div>
                    <p>This OTP will expire in 10 minutes.</p>
                    <p>If you didn't sign up for this account, please ignore this email.</p>
                   <p>Best regards,<br>${appName}</p>
                </div>
            `
        };

        // Send email using Nodemailer
        await transporter.sendMail(mailOptions);
        console.log('OTP email sent successfully to:', user.email);
    } catch (error) {
        console.error('Error sending OTP email:', error.message);
        throw new Error('Failed to send OTP email.');
    }
};

// Function to send Verification Email
const sendVerificationEmail = async (user, verificationToken) => {
    const verificationURL = `${process.env.FRONTEND_URL}/verify-email/${encodeURIComponent(verificationToken)}`;

    const mailOptions = {
        from: process.env.SENDGRID_FROM_EMAIL,
        to: user.email,
        subject: 'Email Verification',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1>Email Verification</h1>
                <p>Hello ${user.firstName} ${user.lastName},</p>
                <p>Thank you for signing up. Please click the button below to verify your email:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${verificationURL}" 
                       style="background-color: #4CAF50; color: white; padding: 14px 20px; 
                              text-decoration: none; border-radius: 4px;">
                        Verify Email
                    </a>
                </div>
                <p>If you didn't sign up for this account, please ignore this email.</p>
                <p>This link will expire in 1 hour.</p>
                <p>Best regards,<br>${appName}</p>
            </div>
        `
    };

    await transporter.sendMail(mailOptions);
};

// Function to send Password Reset Email
const sendPasswordResetEmail = async (user, resetToken) => {
    const resetURL = `${process.env.FRONTEND_URL}/reset-password/${encodeURIComponent(resetToken)}`;

    const mailOptions = {
        from: process.env.SENDGRID_FROM_EMAIL,
        to: user.email,
        subject: 'Password Reset Request',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1>Password Reset Request</h1>
                <p>Hello ${user.fullName},</p>
                <p>You requested to reset your password. Click the button below to reset it:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetURL}" 
                       style="background-color: #4CAF50; color: white; padding: 14px 20px; 
                              text-decoration: none; border-radius: 4px;">
                        Reset Password
                    </a>
                </div>
                <p>If you didn't request this, please ignore this email.</p>
                <p>This link will expire in 1 hour.</p>
                <p>Best regards,<br>${appName}</p>
            </div>
        `
    };

    await transporter.sendMail(mailOptions);
};

// Function to send Password Reset Confirmation Email
const sendPasswordResetConfirmationEmail = async (user) => {
    const mailOptions = {
        from: process.env.SENDGRID_FROM_EMAIL,
        to: user.email,
        subject: 'Password Reset Successful',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1>Password Reset Successful</h1>
                <p>Hello ${user.fullName},</p>
                <p>Your password has been successfully reset.</p>
                <p>If you didn't perform this action, please contact our support team immediately.</p>
                <p>Best regards,<br>${appName}</p>
            </div>
        `
    };

    await transporter.sendMail(mailOptions);
};

// Function to resend Verification Email
const resendVerificationEmailUtil = async (user, verificationToken) => {
    const verificationURL = `${process.env.FRONTEND_URL}/verify-email/${encodeURIComponent(verificationToken)}`;

    const mailOptions = {
        from: process.env.SENDGRID_FROM_EMAIL,
        to: user.email,
        subject: 'Email Verification Request',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1>Email Verification Request</h1>
                <p>Hello ${user.fullName},</p>
                <p>You requested to verify your email address. Click the button below to verify it:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${verificationURL}" 
                       style="background-color: #4CAF50; color: white; padding: 14px 20px; 
                              text-decoration: none; border-radius: 4px;">
                        Verify Email
                    </a>
                </div>
                <p>If you didn't request this, please ignore this email.</p>
                <p>This link will expire in 1 hour.</p>
                <p>Best regards,<br>${appName}</p>
            </div>
        `
    };

    await transporter.sendMail(mailOptions);
};

// Function to send Custom Confirmation Email
const sendCustomConfirmationEmail = async (
    user,
    type,
    title,
    message
) => {
    const mailOptions = {
        from: process.env.SENDGRID_FROM_EMAIL,
        to: user.email,
        subject: `${type}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1>${title}</h1>
                <p>Hello ${user.userName},</p>
                <p>${message}</p>
                <p>Best regards, NIRDC Staff <br>${appName}</p>
            </div>
        `
    };

    await transporter.sendMail(mailOptions);
};

module.exports = {
    sendOTPEmail,
    sendVerificationEmail,
    sendPasswordResetEmail,
    sendPasswordResetConfirmationEmail,
    resendVerificationEmailUtil,
    sendCustomConfirmationEmail
};
