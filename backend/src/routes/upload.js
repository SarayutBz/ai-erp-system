const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { parseInvoice } = require('../services/gemini')
const normalizer = require('../pipeline/normalizer')
const Customer = require('../models/Customer')
const Order = require('../models/Order')
const AuditLog = require('../models/AuditLog')

// setup multer — เก็บไฟล์ใน uploads/
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads/'
        if (!fs.existsSync(dir)) fs.mkdirSync(dir)
        cb(null, dir)
    },
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9)
        cb(null, unique + path.extname(file.originalname))
    },
})

const fileFilter = (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    if (allowed.includes(file.mimetype)) {
        cb(null, true)
    } else {
        cb(new Error('Only images and PDF are allowed'), false)
    }
}

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
})

// POST /api/upload — รับ invoice
router.post('/', upload.single('invoice'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' })
    }

    const filePath = req.file.path
    const mimeType = req.file.mimetype

    try {
        // 1. ส่งให้ Gemini parse
        const parsed = await parseInvoice(filePath, mimeType)

        // 2. ส่งเข้า normalize pipeline เหมือนกันกับ form
        const result = await normalizer.process('upload', parsed)

        if (!result.success) {
            return res.status(400).json({ error: result.error })
        }

        const { normalized, rawInputId } = result

        // 3. หา customer หรือสร้างใหม่
        let customer = await Customer.findOne({ name: normalized.customer.name })
        if (!customer) {
            customer = await Customer.create(normalized.customer)
        }

        // 4. สร้าง order
        const order = await Order.create({
            customer: customer._id,
            items: normalized.items,
            source: 'upload',
            rawInputId,
            status: 'done',
        })

        // 5. audit log
        await AuditLog.create({
            action: 'order.created',
            source: 'upload',
            status: 'success',
            refId: order._id,
            refModel: 'Order',
            message: `Order created from invoice upload`,
        })

        res.status(201).json({ success: true, order, parsed })
    } catch (err) {
        await AuditLog.create({
            action: 'invoice.parse_error',
            source: 'upload',
            status: 'error',
            message: err.message,
        })

        res.status(500).json({ error: err.message })
    } finally {
        // ลบไฟล์หลังประมวลผลเสร็จเสมอ
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath)
        }
    }
})

module.exports = router