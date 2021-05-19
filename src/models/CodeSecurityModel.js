const mongoose = require('mongoose');

const CodeSecurity = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    code: {
        type: String,
        required: true,
    },
    expireAt: {
        type: Date,
        default: Date.now,
        index: { expires: '5m' }
    }
});

module.exports = mongoose.model('CodeSecurity', CodeSecurity);