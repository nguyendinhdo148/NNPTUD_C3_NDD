let mongoose = require('mongoose');

let roleSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: [true, "Tên role không được trùng"],
        required: [true, "Tên role không được để trống"]
    },
    description: {
        type: String,
        default: ""
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('roles', roleSchema);