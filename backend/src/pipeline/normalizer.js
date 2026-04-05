const RawInput = require('../models/RawInput')
const AuditLog = require('../models/AuditLog')

class Normalizer {
    /**
     * entry point หลัก — ทุก input ต้องผ่านตรงนี้
     * @param {string} source - 'form' | 'upload' | 'voice'
     * @param {object} rawData - ข้อมูลดิบจาก input
     */
    async process(source, rawData) {
        // 1. บันทึก raw input ก่อนเสมอ
        const rawInput = await RawInput.create({
            source,
            status: 'processing',
            rawData,
        })

        try {
            // 2. normalize ตาม source
            let normalized
            if (source === 'form') {
                normalized = this._fromForm(rawData)
            } else if (source === 'upload') {
                normalized = this._fromUpload(rawData)
            } else {
                throw new Error(`Unknown source: ${source}`)
            }

            // 3. validate ผลลัพธ์
            this._validate(normalized)

            // 4. update rawInput ว่าสำเร็จ
            rawInput.normalizedData = normalized
            rawInput.status = 'done'
            await rawInput.save()

            // 5. บันทึก audit log
            await AuditLog.create({
                action: 'input.normalized',
                source,
                status: 'success',
                refId: rawInput._id,
                refModel: 'RawInput',
                message: `Normalized from ${source}`,
            })

            return { success: true, rawInputId: rawInput._id, normalized }
        } catch (err) {
            // บันทึก error ทั้ง rawInput และ auditLog
            rawInput.status = 'error'
            rawInput.errorMessage = err.message
            await rawInput.save()

            await AuditLog.create({
                action: 'input.normalize_error',
                source,
                status: 'error',
                refId: rawInput._id,
                refModel: 'RawInput',
                message: err.message,
                payload: rawData,
            })

            return { success: false, error: err.message, rawInputId: rawInput._id }
        }
    }

    // ----------------------------------------------------
    // private methods — แปลงแต่ละ source ให้เป็น format เดียว
    // ----------------------------------------------------

    _fromForm(data) {
        return {
            customer: {
                name: data.customerName,
                email: data.customerEmail || null,
                phone: data.customerPhone || null,
            },
            items: data.items.map((item) => ({
                name: item.name,
                qty: Number(item.qty),
                price: Number(item.price),
            })),
        }
    }

    _fromUpload(data) {
        // data มาจาก Gemini parse แล้ว
        // Gemini จะ return structure คล้ายกัน แต่ field name อาจต่างกัน
        return {
            customer: {
                name: data.customer_name || data.customerName || data.buyer || '',
                email: data.customer_email || data.email || null,
                phone: data.customer_phone || data.phone || null,
            },
            items: (data.items || data.line_items || []).map((item) => ({
                name: item.name || item.description || item.item,
                qty: Number(item.qty || item.quantity || 1),
                price: Number(item.price || item.unit_price || 0),
            })),
        }
    }

    _validate(normalized) {
        if (!normalized.customer?.name) {
            throw new Error('Customer name is required')
        }
        if (!Array.isArray(normalized.items) || normalized.items.length === 0) {
            throw new Error('Order must have at least 1 item')
        }
        for (const item of normalized.items) {
            if (!item.name) throw new Error('Item name is required')
            if (item.qty <= 0) throw new Error(`Invalid qty for item: ${item.name}`)
            if (item.price < 0) throw new Error(`Invalid price for item: ${item.name}`)
        }
    }
}

module.exports = new Normalizer()