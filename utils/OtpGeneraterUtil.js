function generateNumericOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateAlphanumericOtp() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let otp = '';
    for (let i = 0; i < 6; i++) {
        otp += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return otp;
}


module.exports = {generateNumericOtp, generateAlphanumericOtp}
