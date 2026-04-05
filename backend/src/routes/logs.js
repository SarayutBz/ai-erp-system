const express = require('express')
const router = express.Router()
const AuditLog = require('../models/AuditLog')
const RawInput = require('../models/RawInput')

// GET /api/logs — ดึง audit logs ทั้งหมด
router.get('/', async (req, res) => {
    try {
        const { source, status, limit = 50, page = 1 } = req.query

        const filter = {}
        if (source) filter.source = source
        if (status) filter.status = status

        const skip = (Number(page) - 1) * Number(limit)

        const [logs, total] = await Promise.all([
            AuditLog.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit)),
            AuditLog.countDocuments(filter),
        ])

        res.json({
            total,
            page: Number(page),
            totalPages: Math.ceil(total / Number(limit)),
            logs,
        })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// GET /api/logs/pipeline-status — ภาพรวม pipeline ทั้งหมด
router.get('/pipeline-status', async (req, res) => {
    try {
        const [inputStats, logStats] = await Promise.all([
            // นับ rawInput แยกตาม status + source
            RawInput.aggregate([
                {
                    $group: {
                        _id: { source: '$source', status: '$status' },
                        count: { $sum: 1 },
                    },
                },
            ]),

            // นับ auditLog แยกตาม status
            AuditLog.aggregate([
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 },
                    },
                },
            ]),
        ])

        // แปลง aggregate result ให้อ่านง่าย
        const pipeline = {}
        for (const item of inputStats) {
            const { source, status } = item._id
            if (!pipeline[source]) pipeline[source] = {}
            pipeline[source][status] = item.count
        }

        const summary = {}
        for (const item of logStats) {
            summary[item._id] = item.count
        }

        res.json({
            pipeline,   // เช่น { form: { done: 5, error: 1 }, upload: { done: 3 } }
            summary,    // เช่น { success: 8, error: 1 }
        })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// GET /api/logs/pipeline-status/:rawInputId — status ของ job เดียว
router.get('/pipeline-status/:rawInputId', async (req, res) => {
    try {
        const { rawInputId } = req.params

        const [rawInput, logs] = await Promise.all([
            RawInput.findById(rawInputId),
            AuditLog.find({ refId: rawInputId }).sort({ createdAt: 1 }),
        ])

        if (!rawInput) {
            return res.status(404).json({ error: 'RawInput not found' })
        }

        res.json({
            rawInput: {
                id: rawInput._id,
                source: rawInput.source,
                status: rawInput.status,
                errorMessage: rawInput.errorMessage || null,
                createdAt: rawInput.createdAt,
                updatedAt: rawInput.updatedAt,
            },
            timeline: logs.map((log) => ({
                action: log.action,
                status: log.status,
                message: log.message,
                timestamp: log.createdAt,
            })),
        })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

module.exports = router