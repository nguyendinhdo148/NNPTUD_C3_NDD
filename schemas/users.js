const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Username không được để trống"],
        unique: true
    },
    password: {
        type: String,
        required: [true, "Password không được để trống"]
    },
    email: {
        type: String,
        required: [true, "Email không được để trống"],
        unique: true
    },
    fullName: {
        type: String,
        default: ""
    },
    avatarUrl: {
        type: String,
        default: "https://i.sstatic.net/l60Hf.png"
    },
    status: {
        type: Boolean,
        default: false
    },
    role: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "roles",   // ⚠️ phải trùng với mongoose.model("roles")
        required: true
    },
    loginCount: {
        type: Number,
        default: 0,
        min: 0
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("users", userSchema);