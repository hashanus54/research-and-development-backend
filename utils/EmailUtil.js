const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendVerificationEmail = async (user, verificationToken) => {
    const verificationURL = `${process.env.FRONTEND_URL}/verify-email/${encodeURIComponent(verificationToken)}`;
    const msg = {
        to: user.email,
        from: process.env.SENDGRID_FROM_EMAIL,
        subject: 'Email Verification',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Email Verification</h2>
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
                <p>Best regards,<br>Your App Team</p>
            </div>
        `
    };
    await sgMail.send(msg);
};

const sendPasswordResetEmail = async (user, resetToken) => {
    const resetURL = `${process.env.FRONTEND_URL}/#/security/reset-password/${encodeURIComponent(resetToken)}`;
    const msg = {
        to: user.email,
        from: process.env.SENDGRID_FROM_EMAIL,
        subject: 'Password Reset Request',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Password Reset Request</h2>
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
                <p>Best regards,<br>Your App Team</p>
            </div>
        `
    };
    await sgMail.send(msg);
};

const sendPasswordResetConfirmationEmail = async (user) => {
    const msg = {
        to: user.email,
        from: process.env.SENDGRID_FROM_EMAIL,
        subject: 'Password Reset Successful',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Password Reset Successful</h2>
                <p>Hello ${user.fullName},</p>
                <p>Your password has been successfully reset.</p>
                <p>If you didn't perform this action, please contact our support team immediately.</p>
                <p>Best regards,<br>Your App Team</p>
            </div>
        `
    };
    await sgMail.send(msg);
};

const resendVerificationEmailUtil = async (user, verificationToken) => {
    const verificationURL = `${process.env.FRONTEND_URL}/verify-email/${encodeURIComponent(verificationToken)}`;
    const msg = {
        to: user.email,
        from: process.env.SENDGRID_FROM_EMAIL,
        subject: 'Email Verification Request',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Email Verification Request</h2>
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
                <p>Best regards,<br>Your App Team</p>
            </div>
        `
    };
    await sgMail.send(msg);
};

module.exports = {
    sendVerificationEmail,
    sendPasswordResetEmail,
    sendPasswordResetConfirmationEmail,
    resendVerificationEmailUtil
};