const mongoose = require('mongoose')

const auditLogSchema = new mongoose.Schema(
    {
        action: { type: String, required: true },
        // เช่น "order.created", "invoice.parsed", "order.error"
        source: {
            type: String,
            enum: ['form', 'upload', 'voice', 'system'],
            required: true,
        },
        status: {
            type: String,
            enum: ['success', 'error', 'processing'],
            required: true,
        },
        refId: { type: mongoose.Schema.Types.ObjectId },
        // reference ไปหา order หรือ rawInput
        refModel: { type: String },
        // "Order" หรือ "RawInput"
        message: { type: String },
        payload: { type: mongoose.Schema.Types.Mixed },
        // เก็บ data ที่ทำให้ error ไว้ debug
    },
    { timestamps: true }
)

module.exports = mongoose.model('AuditLog', auditLogSchema)