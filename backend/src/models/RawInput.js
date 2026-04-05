const mongoose = require('mongoose')

const rawInputSchema = new mongoose.Schema(
    {
        source: {
            type: String,
            enum: ['form', 'upload', 'voice'],
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'processing', 'done', 'error'],
            default: 'pending',
        },
        rawData: { type: mongoose.Schema.Types.Mixed, required: true },
        // เก็บ raw ดิบก่อน normalize ไม่ต้อง pre-define schema
        normalizedData: { type: mongoose.Schema.Types.Mixed },
        // หลัง normalize แล้ว
        errorMessage: { type: String },
    },
    { timestamps: true }
)

module.exports = mongoose.model('RawInput', rawInputSchema)