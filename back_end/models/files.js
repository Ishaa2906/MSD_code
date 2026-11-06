let mongoose = require('mongoose');
let fileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    originalName: {
        type: String,
        required: true
    },
    storagePath: {
        type: String,
        required: true
    },
    mimetype: {
        type: String
    },
    size: {
        type: Number
    },
    isEncrypted: {
        type: Boolean,
        default: false
    },
    iv: {
        type: String,
        default: null
    },
    authTag: {
        type: String,
        default: null
    }
}, { timestamps: true });
let files = mongoose.model('files', fileSchema);
module.exports = { files };
