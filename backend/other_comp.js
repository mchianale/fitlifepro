"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidName = exports.isValidPassword = void 0;
function isValidPassword(password) {
    // Check if the length is greater than or equal to 6
    if (password.length < 6) {
        return false;
    }
    // Check if there is at least one number
    if (!/\d/.test(password)) {
        return false;
    }
    // Check if there is at least one special character (you can customize the character set)
    const specialCharacterRegex = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/;
    if (!specialCharacterRegex.test(password)) {
        return false;
    }
    // All checks passed, the password is valid
    return true;
}
exports.isValidPassword = isValidPassword;
function isValidName(name) {
    // Check if the name contains only alphabetic characters and spaces
    const validNameRegex = /^[a-zA-Z\s]+$/;
    return validNameRegex.test(name);
}
exports.isValidName = isValidName;
//# sourceMappingURL=other_comp.js.map