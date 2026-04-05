const express = require('express')
const router = express.Router()
const normalizer = require('../pipeline/normalizer')
const Customer = require('../models/Customer')
const Order = require('../models/Order')
const AuditLog = require('../models/AuditLog')

// POST /api/orders — รับจาก form
router.post('/', async (req, res) => {
    try {
        // ส่งเข้า pipeline
        const result = await normalizer.process('form', req.body)

        if (!result.success) {
            return res.status(400).json({ error: result.error })
        }

        const { normalized, rawInputId } = result

        // หา customer หรือสร้างใหม่
        let customer = await Customer.findOne({ name: normalized.customer.name })
        if (!customer) {
            customer = await Customer.create(normalized.customer)
        }

        // สร้าง order
        const order = await Order.create({
            customer: customer._id,
            items: normalized.items,
            source: 'form',
            rawInputId,
            status: 'done',
        })

        // audit log
        await AuditLog.create({
            action: 'order.created',
            source: 'form',
            status: 'success',
            refId: order._id,
            refModel: 'Order',
            message: `Order created for ${normalized.customer.name}`,
        })

        res.status(201).json({ success: true, order })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// GET /api/orders — ดึง list
router.get('/', async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('customer', 'name email')
            .sort({ createdAt: -1 })
        res.json(orders)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

module.exports = router