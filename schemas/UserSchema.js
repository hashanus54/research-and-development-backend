const mongoose = require('mongoose');
const ENUMS = require('./enums/UserEnums');

const UserSchema = new mongoose.Schema({
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    mobile: {type: String, required: true},
    password: {type: String, required: true},
    confirmPassword: {type: String, required: true},
    dob: {type: Date, required: false, default: null},
    avatar: {type: String},
    activeState: {type: Boolean, required: true},
    verificationToken: {type: String},
    isVerified: {type: Boolean, required: true},
    passwordResetToken: {type: String, default: null},
    passwordResetTokenExpires: {type: Date, default: null},
    role: {type: String, required: true, enum: ENUMS.ROLES},
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Users', UserSchema);
