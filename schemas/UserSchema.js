const mongoose = require('mongoose');
const ENUMS = require('./enums/UserEnums');


const UserSchema = new mongoose.Schema({
    firstName: {type: String, required: true, maxlength: 50},
    lastName: {type: String, required: true, maxlength: 50},
    designation: {type: String, required: true, maxlength: 100},
    company: {type: String, required: true, maxlength: 100},
    mobile: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    country: {type: String, required: true},
    userName: {type: String},
    password: {type: String, required: true, minLength: 6},
    confirmPassword: {type: String, required: true, minLength: 6},
    avatar: {type: String},
    activeState: {type: Boolean, required: true},
    isVerified: {type: Boolean, required: true},
    passwordResetToken: {type: String, default: null},
    passwordResetTokenExpires: {type: Date, default: null},
    role: {type: String, required: true, enum: ENUMS.ROLES},
    emailOtp: {type: String},
    mobileOtp: {type: Number},
    emailOtpExpiry: {type: Date},
    mobileOtpExpiry: {type: Date},
    isPhoneVerified: {type: Boolean, default: false},
    isEmailVerified: {type: Boolean, default: false},
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now},
    lastLoginTime: {type: Date},

});

module.exports = mongoose.model('Users', UserSchema);
