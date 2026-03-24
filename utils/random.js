const crypto = require("crypto");

module.exports = function generatePassword() {
    return crypto.randomBytes(8).toString("hex");
};