const mongoose = require("mongoose");

const BlackListToken = new mongoose.Schema({
    token: {
        type: String,
        required: true,
    },
    expireAt: {
        type: Date,
        default: Date.now,
        index: {expires: '60m'}
    },
}, { timestamps: true })

module.exports = mongoose.model("blackListToken", BlackListToken);