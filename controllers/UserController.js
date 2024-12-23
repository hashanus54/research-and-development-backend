const UserSchema = require('../schemas/UserSchema');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sgMail = require('@sendgrid/mail');
const crypto = require('crypto');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const initializeAdmin = async () => {
    try {
        const adminEmail = "admin@gmail.com";
        const adminPassword = "admin123";

        const existingAdmin = await UserSchema.findOne({ email: adminEmail });
        if (existingAdmin) {
            return;
        }
        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        const adminUser = new UserSchema({
            firstName: "Admin",
            lastName: "Admin",
            email: adminEmail,
            mobile: "0766308272",
            password: hashedPassword,
            confirmPassword: hashedPassword,
            dob: "",
            avatar: "",
            activeState: true,
            verificationToken: "",
            isVerified: true,
            passwordResetToken: null,
            passwordResetTokenExpires: null,
            role: "ADMIN"
        });
        await adminUser.save();
        console.log("Admin user saved to MongoDB");
    } catch (error) {
        console.error('Error initializing admin:', error);
        throw error;
    }
}


const signUp = async (req, res) => {
    try {
        const { firstName, lastName, email, mobile, password, confirmPassword, dob } = req.body;


        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }


        const existingUser = await UserSchema.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User with this email already exists" });
        }

 
        const hashedPassword = await bcrypt.hash(password, 10);


        const newUser = new UserSchema({
            firstName,
            lastName,
            email,
            mobile,
            password: hashedPassword,
            confirmPassword: hashedPassword,
            dob,
            avatar: "",
            activeState: false, 
            verificationToken: "",
            isVerified: false,
            passwordResetToken: null,
            passwordResetTokenExpires: null,
            role: "USER"
        });

     
        const verificationToken = crypto.randomBytes(32).toString('hex');
        newUser.verificationToken = verificationToken;

    
        await newUser.save();

    
        const verificationURL = `${process.env.FRONTEND_URL}/verify-email/${encodeURIComponent(verificationToken)}`;
        const msg = {
            to: newUser.email,
            from: process.env.SENDGRID_FROM_EMAIL,
            subject: 'Email Verification',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Email Verification</h2>
                    <p>Hello ${newUser.firstName} ${newUser.lastName},</p>
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

        return res.status(201).json({
            status: true,
            message: 'User created successfully. Verification email sent.'
        });

    } catch (error) {
        console.error('Error during signup:', error);
        return res.status(500).json({ message: 'Server error, please try again later' });
    }
};

const verifyUser = async (req, res) => {
    try {
        const { verificationToken } = req.params;

        const user = await UserSchema.findOne({ verificationToken });
        if (!user) {
            return res.status(404).json({
                status: false,
                message: 'Invalid or expired verification token'
            });
        }

        if (user.verificationTokenExpires < Date.now()) {
            return res.status(400).json({
                status: false,
                message: 'Verification token has expired'
            });
        }

        user.isVerified = true;
        user.activeState = true;
        user.verificationToken = "";
        await user.save();

        return res.status(200).json({
            status: true,
            message: 'User verified successfully'
        });

    } catch (error) {
        console.error('Error verifying user:', error);
        return res.status(500).json({
            status: false,
            message: 'Internal server error'
        });
    }
};


const signIn = async (req, res) => {
    try {
        const selectedUser = await UserSchema.findOne({ email: req.body.email });
        if (!selectedUser) {
            return res.status(404).json({ status: false, message: 'USERNAME NOT FOUND' });
        }
        if (!selectedUser.isVerified) {
            return res.status(401).json({ status: false, message: 'USER NOT VERIFIED' });
        }
        const isPasswordValid = await bcrypt.compare(req.body.password, selectedUser.password);
        if (!isPasswordValid) {
            return res.status(401).json({ status: false, message: "INCORRECT PASSWORD" });
        }
        selectedUser.loginTime = new Date().toISOString();
        await selectedUser.save();

        const role = selectedUser.role ? 'ADMIN' : 'USER';

        const token = jwt.sign({ 'email': selectedUser.email, role }, process.env.SECRET_KEY, { expiresIn: 3600 });
        res.setHeader('Authorization', `Bearer ${token}`);

        return res.status(200).json({ status: true, message: "USER LOGIN SUCCESSFULLY", token });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await UserSchema.findOne({ email });
        if (!user) {
            return res.status(404).json({
                status: false,
                message: 'USER NOT FOUND'
            });
        }
        const resetToken = crypto.randomBytes(32).toString('hex');
        const passwordResetToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');
        user.passwordResetToken = passwordResetToken;
        user.passwordResetTokenExpires = new Date(Date.now() + 60 * 60 * 1000);
        await user.save();
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
        return res.status(200).json({
            status: true,
            message: 'PASSWORD RESET LINK SENT TO EMAIL'
        });

    } catch (error) {
        console.error('Error in forgot password:', error);
        return res.status(500).json({
            status: false,
            message: 'INTERNAL SERVER ERROR'
        });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        const passwordResetToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');
        const user = await UserSchema.findOne({
            passwordResetToken,
            passwordResetTokenExpires: { $gt: Date.now() }
        });
        if (!user) {
            return res.status(400).json({
                status: false,
                message: 'TOKEN IS INVALID OR HAS EXPIRED'
            });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.passwordResetToken = null;
        user.passwordResetTokenExpires = null;
        await user.save();
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
        return res.status(200).json({
            status: true,
            message: 'PASSWORD RESET SUCCESSFUL'
        });
    } catch (error) {
        console.error('Error in reset password:', error);
        return res.status(500).json({
            status: false,
            message: 'INTERNAL SERVER ERROR'
        });
    }
};

module.exports = {
    initializeAdmin,
    signUp,
    verifyUser,
    signIn,
    forgotPassword,
    resetPassword
}