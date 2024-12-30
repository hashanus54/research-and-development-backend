const UserSchema = require('../schemas/UserSchema');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const {createSMSClient, createSession, sendMessage, closeSession} = require('../utils/SMSUtil');
const {sendPasswordResetEmail, sendPasswordResetConfirmationEmail, sendOTPEmail} = require('../utils/EmailUtil');
const { generateNumericOtp, generateAlphanumericOtp } = require('../utils/OtpGeneraterUtil');



const appName = process.env.APPLICATION_NAME;

const initializeAdmin = async () => {
    try {
        const adminFirstName = process.env.ADMIN_USER_FIRST_NAME;
        const adminLastName = process.env.ADMIN_USER_LAST_NAME;
        const adminEmail = process.env.ADMIN_USER_EMAIL;
        const adminPassword = process.env.ADMIN_USER_PASSWORD;
        const adminMobile = process.env.ADMIN_USER_MOBILE;

        const existingAdmin = await UserSchema.findOne({email: adminEmail});
        if (existingAdmin) {
            return;
        }
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        const adminUser = new UserSchema({
            firstName: adminFirstName,
            lastName: adminLastName,
            email: adminEmail,
            mobile: adminMobile,
            password: hashedPassword,
            confirmPassword: hashedPassword,
            dob: "",
            avatar: "",
            activeState: true,
            isVerified: true,
            passwordResetToken: null,
            passwordResetTokenExpires: null,
            role: "SUPER_ADMIN",
            otp: null,
            otpExpiry: null,
            isPhoneVerified: true,
            isEmailVerified: true
        });
        await adminUser.save();
        console.log("Admin user saved to MongoDB");
    } catch (error) {
        console.error('Error initializing admin:', error);
        throw error;
    }
}

const signIn = async (req, res) => {
    try {
        const selectedUser = await UserSchema.findOne({email: req.body.email});
        if (!selectedUser) {
            return res.status(404).json({status: false, message: 'USERNAME NOT FOUND'});
        }
        if (!selectedUser.isVerified) {
            return res.status(401).json({status: false, message: 'Please verify your email and phone number'});
        }
        const isPasswordValid = await bcrypt.compare(req.body.password, selectedUser.password);
        if (!isPasswordValid) {
            return res.status(401).json({status: false, message: "INCORRECT PASSWORD"});
        }
        selectedUser.loginTime = new Date().toISOString();
        await selectedUser.save();

        const role = selectedUser.role;

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
            return res.status(400).json({message: "Passwords do not match."});
        }
        const existingUser = await UserSchema.findOne({email});
        if (existingUser) {
            return res.status(400).json({message: "User with this email already exists."});
        }
        if (!mobile || !/^\d{10,15}$/.test(mobile)) {
            return res.status(400).json({message: 'A valid mobile number is required.'});
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const emailOtp = generateAlphanumericOtp();
        const mobileOtp = generateNumericOtp();

        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

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
            isVerified: false,
            passwordResetToken: null,
            passwordResetTokenExpires: null,
            role: "USER",
            emailOtp,
            mobileOtp,
            emailOtpExpiry:otpExpiry,
            mobileOtpExpiry:otpExpiry,
            isPhoneVerified: false,
            isEmailVerified: false
        });

        await newUser.save();

        // Send OTP email
        await sendOTPEmail(newUser, emailOtp);

        // // SMS configuration
        // const smsConfig = {
        //     username: process.env.SMS_USERNAME,
        //     password: process.env.SMS_PASSWORD
        // };
        //
        // const client = await createSMSClient(smsConfig);
        // const session = await createSession(client, smsConfig);
        //
        // // SMS messages
        // const welcomeMessage = `Welcome to ${process.env.APP_NAME || 'Your App'}, ${firstName}!`;
        // const otpMessage = `Your OTP for account verification is: ${mobileOtp}. This code will expire in 10 minutes.`;
        //
        // await Promise.all([
        //     sendMessage(client, session, process.env.SMS_SENDER_ALIAS, welcomeMessage, [mobile]),
        //     sendMessage(client, session, process.env.SMS_SENDER_ALIAS, otpMessage, [mobile])
        // ]);
        //
        // await closeSession(client, session);

        return res.status(201).json({
            status: true,
            message: 'User created successfully. Please verify your account with the OTP sent to your email and phone.'
        });

    } catch (error) {
        console.error('Error during signup:', error);
        return res.status(500).json({message: 'Server error, please try again later.'});
    }
};

/*const verifyUserWithOtp = async (req, res) => {
    try {
        const {email, otp, verificationType} = req.body;

        const user = await UserSchema.findOne({email});
        if (!user) {
            return res.status(404).json({message: 'User not found'});
        }

        if (user.otpExpiry < new Date()) {
            return res.status(400).json({message: 'OTP has expired. Please request a new one.'});
        }

        if (user.otp !== parseInt(otp)) {
            return res.status(400).json({message: 'Invalid OTP'});
        }

        if (verificationType === 'phone') {
            user.isPhoneVerified = true;
        } else if (verificationType === 'email') {
            user.isEmailVerified = true;
        } else {
            return res.status(400).json({message: 'Invalid verification type'});
        }

        if (user.isPhoneVerified || user.isEmailVerified) {
            user.isVerified = true;
            user.activeState = true;
            user.otp = 0;
            user.otpExpiry = null;
        }

        await user.save();

        return res.status(200).json({
            status: true,
            message: `${verificationType === 'phone' ? 'Phone number' : 'Email'} verified successfully`
        });

    } catch (error) {
        console.error('Error during OTP verification:', error);
        return res.status(500).json({message: 'Server error, please try again later'});
    }
};

*/

const verifyEmailWithOtp = async (req, res) => {
    try {
        const { email, emailOtp } = req.body;

        // Log the email and entered OTP for debugging
        console.log('Received email:', email);
        console.log('Received OTP:', emailOtp);

        // Find the user by email
        const user = await UserSchema.findOne({ email });
        if (!user) {
            console.log('User not found:', email);
            return res.status(404).json({ message: 'User not found' });
        }

        // Log the existing OTP and expiry for debugging
        console.log('Existing OTP in database:', user.emailOtp);
        console.log('OTP expiry:', user.emailOtpExpiry);

        if (user.emailOtpExpiry < new Date()) {
            console.log('OTP has expired for user:', email);
            return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
        }

        // Compare OTPs as strings
        if (user.emailOtp.trim() !== emailOtp.trim()) {
            console.log('Invalid OTP entered:', emailOtp);
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        // Mark the email as verified
        user.isEmailVerified = true;

        if (user.isEmailVerified && user.isPhoneVerified) {
            user.activeState = true;
            user.isVerified = true;
        }

        // Reset OTP and expiry
        user.emailOtp = 0;
        user.emailOtpExpiry = null;

        await user.save();

        console.log('Email verified successfully:', email);

        return res.status(200).json({
            status: true,
            message: 'Email verified successfully',
        });
    } catch (error) {
        console.error('Error during email OTP verification:', error);
        return res.status(500).json({ message: 'Server error, please try again later' });
    }
};

const verifyPhoneWithOtp = async (req, res) => {
    try {
        const { email, mobileOtp } = req.body;

        const user = await UserSchema.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.mobileOtpExpiry < new Date()) {
            return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
        }

        if (user.mobileOtp !== parseInt(mobileOtp)) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        user.isPhoneVerified = true;

        if (user.isEmailVerified && user.isPhoneVerified) {
            user.activeState = true;
            user.isVerified = true;
        }

        user.mobileOtp = 0;
        user.mobileOtpExpiry = null;

        await user.save();

        return res.status(200).json({
            status: true,
            message: 'Phone number verified successfully',
        });
    } catch (error) {
        console.error('Error during phone OTP verification:', error);
        return res.status(500).json({ message: 'Server error, please try again later' });
    }
};

const resendOTP = async (req, res) => {
    try {
        const {email} = req.body;

        const user = await UserSchema.findOne({email});
        if (!user) {
            return res.status(404).json({message: 'User not found'});
        }

        const emailOtp = generateAlphanumericOtp();
        const mobileOtp = generateNumericOtp();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

        user.emailOtp = emailOtp;
        user.mobileOtp = mobileOtp;
        user.emailOtpExpiry = otpExpiry;
        user.mobileOtpExpiry = otpExpiry;
        await user.save();

        await sendOTPEmail(user, emailOtp);

        // // Send new OTP via SMS
        // const smsConfig = {
        //     username: process.env.SMS_USERNAME,
        //     password: process.env.SMS_PASSWORD
        // };
        //
        // const client = await createSMSClient(smsConfig);
        // const session = await createSession(client, smsConfig);
        //
        // const otpMessage = `Your new OTP for account verification is: ${otp}. This code will expire in 10 minutes.`;
        // await sendMessage(
        //     client,
        //     session,
        //     process.env.SMS_SENDER_ALIAS,
        //     otpMessage,
        //     [user.mobile]
        // );
        //
        // await closeSession(client, session);

        return res.status(200).json({
            status: true,
            message: 'New OTP has been sent to your email and phone number'
        });

    } catch (error) {
        console.error('Error resending OTP:', error);
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


//===================================== Director Endpoints ==================================================


const createDirector = async (req, res) => {
    try {
        const {firstName, lastName, email, mobile, password, confirmPassword, dob} = req.body;

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                message: "Password must be at least 8 characters long and include uppercase, lowercase, a number, and a special character."
            });
        }
        if (password !== confirmPassword) {
            return res.status(400).json({message: "Passwords do not match."});
        }
        const existingUser = await UserSchema.findOne({email});
        if (existingUser) {
            return res.status(400).json({message: "User with this email already exists."});
        }
        if (!mobile || !/^\d{10,15}$/.test(mobile)) {
            return res.status(400).json({message: 'A valid mobile number is required.'});
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const tempDirectorUser = new UserSchema({
            firstName,
            lastName,
            email,
            mobile,
            password: hashedPassword,
            confirmPassword: hashedPassword,
            dob,
            avatar: "",
            activeState: true,
            isVerified: true,
            passwordResetToken: null,
            passwordResetTokenExpires: null,
            role: "DIRECTOR",
            otp: null,
            otpExpiry: null,
            isPhoneVerified: true,
            isEmailVerified: true
        });

        await tempDirectorUser.save();
        return res.status(201).json({
            status: true,
            message: 'Director Created Successfully'
        });

    } catch (error) {
        return res.status(500).json({message: 'Server error, please try again later.'});
    }
};

const updateUser = (req, res) => {
    const userId = req.params.id;
    const updates = req.body;
    UserSchema.findOne({_id: userId})
        .then(user => {
            if (!user) {
                return res.status(404).json({status: false, message: 'User not found'});
            }
            if (updates.password) {
                const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
                if (!passwordRegex.test(updates.password)) {
                    return res.status(400).json({
                        status: false,
                        message: "Password must be at least 8 characters long and include uppercase, lowercase, a number, and a special character."
                    });
                }
                if (updates.password !== updates.confirmPassword) {
                    return res.status(400).json({status: false, message: "Passwords do not match."});
                }
                updates.password = bcrypt.hashSync(updates.password, 10);
            }

            if (updates.email && updates.email !== user.email) {
                return UserSchema.findOne({email: updates.email})
                    .then(existingUser => {
                        if (existingUser) {
                            return res.status(400).json({
                                status: false,
                                message: "User with this email already exists."
                            });
                        }
                    });
            }

            if (updates.mobile && !/^\d{10,15}$/.test(updates.mobile)) {
                return res.status(400).json({status: false, message: 'A valid mobile number is required.'});
            }

            UserSchema.updateOne({_id: userId}, {$set: updates})
                .then(result => {
                    if (result.modifiedCount > 0) {
                        return res.status(200).json({
                            status: true,
                            message: 'USER UPDATED SUCCESSFULLY',
                        });
                    } else {
                        return res.status(200).json({status: false, message: 'NO CHANGES MADE'});
                    }
                })
                .catch(error => {
                    res.status(500).json({status: false, message: 'SERVER ERROR', error: error.message});
                });
        })
        .catch(error => {
            res.status(500).json({status: false, message: 'SERVER ERROR', error: error.message});
        });
};

const updateUserRole = (req, res) => {

    const userId = req.params.id;
    const {role} = req.body;
    const requestUserRole = req.user.role;

    if (requestUserRole !== 'SUPER_ADMIN') {
        return res.status(403).json({status: false, message: 'Permission denied. Only SuperAdmin can update roles.'});
    }

    const validRoles = ['USER', 'ADMIN', 'DIRECTOR'];
    if (!validRoles.includes(role)) {
        return res.status(400).json({status: false, message: 'Invalid role provided'});
    }

    UserSchema.findOne({_id: userId})
        .then(user => {
            if (!user) {
                return res.status(404).json({status: false, message: 'User not found'});
            }
            UserSchema.updateOne({_id: userId}, {$set: {role: role}})
                .then(result => {
                    if (result.modifiedCount > 0) {
                        return res.status(200).json({
                            status: true,
                            message: 'USER ROLE UPDATED SUCCESSFULLY',
                        });
                    } else {
                        return res.status(200).json({status: false, message: 'NO CHANGES MADE'});
                    }
                })
                .catch(error => {
                    res.status(500).json({status: false, message: 'SERVER ERROR', error: error.message});
                });
        })
        .catch(error => {
            res.status(500).json({status: false, message: 'SERVER ERROR', error: error.message});
        });
};

const deleteUser = (req, res) => {

    const userId = req.params.id;
    const requestUserRole = req.user.role;

    if (requestUserRole !== 'SUPER_ADMIN') {
        return res.status(403).json({status: false, message: 'Permission denied. Only SuperAdmin can delete users.'});
    }

    UserSchema.findOne({_id: userId})
        .then(user => {
            if (!user) {
                return res.status(404).json({status: false, message: 'User not found'});
            }

            UserSchema.updateOne({_id: userId}, {
                $set: {
                    activeState: false,
                    isVerified: false,
                    isPhoneVerified: false,
                    isEmailVerified: false,

                }
            })
                .then(result => {
                    if (result.modifiedCount > 0) {
                        return res.status(200).json({
                            status: true,
                            message: 'USER DELETED SUCCESSFULLY',
                        });
                    } else {
                        return res.status(200).json({status: false, message: 'NO CHANGES MADE'});
                    }
                })
                .catch(error => {
                    res.status(500).json({status: false, message: 'SERVER ERROR', error: error.message});
                });
        })
        .catch(error => {
            res.status(500).json({status: false, message: 'SERVER ERROR', error: error.message});
        });
};


module.exports = {
    initializeAdmin,
    signUp,
    signIn,
    forgotPassword,
    resetPassword,
    verifyEmailWithOtp,
    verifyPhoneWithOtp,
    resendOTP,
    createDirector,
    updateUser,
    updateUserRole,
    deleteUser
};