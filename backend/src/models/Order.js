const mongoose = require('mongoose')

const orderItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  qty: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
})

const orderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    items: [orderItemSchema],
    totalAmount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['pending', 'processing', 'done', 'error'],
      default: 'pending',
    },
    source: {
      type: String,
      enum: ['form', 'upload', 'voice'],
      required: true,
    },
    rawInputId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RawInput',
    },
  },
  { timestamps: true }
)

// auto คำนวณ totalAmount ก่อน save
orderSchema.pre('save', function (next) {
  this.totalAmount = this.items.reduce(
    (sum, item) => sum + item.qty * item.price,
    0
  )
  next()
})

module.exports = mongoose.model('Order', orderSchema)