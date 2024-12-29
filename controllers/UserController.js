const UserSchema = require('../schemas/UserSchema');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { createSMSClient, createSession, sendMessage, closeSession } = require('../utils/SMSUtil');
const {
    sendVerificationEmail,
    sendPasswordResetEmail,
    sendPasswordResetConfirmationEmail,
    resendVerificationEmailUtil
} = require('../utils/EmailUtil');


const initializeAdmin = async () => {
    try {
        const adminEmail = "admin@gmail.com";
        const adminPassword = "admin123";

        const existingAdmin = await UserSchema.findOne({email: adminEmail});
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

const verifyUser = async (req, res) => {
    try {
        const {verificationToken} = req.params;

        const user = await UserSchema.findOne({verificationToken});
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
        const selectedUser = await UserSchema.findOne({email: req.body.email});
        if (!selectedUser) {
            return res.status(404).json({status: false, message: 'USERNAME NOT FOUND'});
        }
        if (!selectedUser.isVerified) {
            return res.status(401).json({status: false, message: 'USER NOT VERIFIED'});
        }
        const isPasswordValid = await bcrypt.compare(req.body.password, selectedUser.password);
        if (!isPasswordValid) {
            return res.status(401).json({status: false, message: "INCORRECT PASSWORD"});
        }
        selectedUser.loginTime = new Date().toISOString();
        await selectedUser.save();

        const role = selectedUser.role ? 'ADMIN' : 'USER';

        const token = jwt.sign({
            'email': selectedUser.email,
            role,
            id: selectedUser._id
        }, process.env.SECRET_KEY, {expiresIn: 3600});
        res.setHeader('Authorization', `Bearer ${token}`);

        return res.status(200).json({status: true, message: "USER LOGIN SUCCESSFULLY", token});

    } catch (error) {
        console.error(error);
        return res.status(500).json({message: 'Internal server error'});
    }
}



const signUp = async (req, res) => {
    try {
        const {firstName, lastName, email, mobile, password, confirmPassword, dob} = req.body;

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                message: "Password must be at least 8 characters long and include uppercase, lowercase, a number, and a special character."
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({message: "Passwords do not match"});
        }

        const existingUser = await UserSchema.findOne({email});
        if (existingUser) {
            return res.status(400).json({message: "User with this email already exists"});
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = crypto.randomBytes(32).toString('hex');

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
            verificationToken,
            isVerified: false,
            passwordResetToken: null,
            passwordResetTokenExpires: null,
            role: "USER"
        });

        await newUser.save();
        await sendVerificationEmail(newUser, verificationToken);

        return res.status(201).json({
            status: true,
            message: 'User created successfully. Verification email sent.'
        });

    } catch (error) {
        console.error('Error during signup:', error);
        return res.status(500).json({message: 'Server error, please try again later'});
    }
};

const forgotPassword = async (req, res) => {
    try {
        const {email} = req.body;
        const user = await UserSchema.findOne({email});
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

        await sendPasswordResetEmail(user, resetToken);

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
        const {token, newPassword} = req.body;
        const passwordResetToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');
        const user = await UserSchema.findOne({
            passwordResetToken,
            passwordResetTokenExpires: {$gt: Date.now()}
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

        await sendPasswordResetConfirmationEmail(user);

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

const resendVerificationEmail = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await UserSchema.findOne({ email });
        if (!user) {
            return res.status(404).json({
                status: false,
                message: 'USER NOT FOUND'
            });
        }
        if (user.isVerified) {
            return res.status(400).json({
                status: false,
                message: 'Email already verified'
            });
        }

        if (!user.verificationToken || !user.verificationTokenExpires) {
            return res.status(400).json({
                status: false,
                message: 'No verification token found or token expired'
            });
        }

        const currentTime = new Date();
        if (user.verificationTokenExpires < currentTime) {
            return res.status(400).json({
                status: false,
                message: 'Verification token has expired'
            });
        }

        await resendVerificationEmailUtil(user, user.verificationToken);

        return res.status(200).json({
            status: true,
            message: 'VERIFICATION EMAIL SENT TO EMAIL'
        });

    } catch (error) {
        console.error('Error in resend verification email:', error);
        return res.status(500).json({
            status: false,
            message: 'INTERNAL SERVER ERROR'
        });
    }
};

const signUpWithMessage = async (req, res) => {
    try {
        const {firstName, lastName, email, mobile, password, confirmPassword, dob} = req.body;

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                message: "Password must be at least 8 characters long and include uppercase, lowercase, a number, and a special character."
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({message: "Passwords do not match"});
        }

        const existingUser = await UserSchema.findOne({email});
        if (existingUser) {
            return res.status(400).json({message: "User with this email already exists"});
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = crypto.randomBytes(32).toString('hex');

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
            verificationToken,
            isVerified: false,
            passwordResetToken: null,
            passwordResetTokenExpires: null,
            role: "USER"
        });

        await newUser.save();
        await sendVerificationEmail(newUser, verificationToken);

        const smsConfig = {
            username: process.env.SMS_USERNAME,
            password: process.env.SMS_PASSWORD
        };

        const client = await createSMSClient(smsConfig);
        const session = await createSession(client, smsConfig);

        const smsMessage = `Welcome to YourApp, ${firstName}! Please check your email to verify your account.`;
        await sendMessage(
            client,
            session,
            process.env.SMS_SENDER_ALIAS,
            smsMessage,
            [mobile]
        );

        await closeSession(client, session);

        return res.status(201).json({
            status: true,
            message: 'User created successfully. Verification email and SMS sent.'
        });

    } catch (error) {
        console.error('Error during signup:', error);
        return res.status(500).json({message: 'Server error, please try again later'});
    }
};

module.exports = {
    initializeAdmin,
    signUp,
    verifyUser,
    signIn,
    forgotPassword,
    resetPassword,
    resendVerificationEmail,
    signUpWithMessage
};