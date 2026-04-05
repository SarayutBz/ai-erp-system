require('dotenv').config()
const express = require('express')
const cors = require('cors')
const connectDB = require('./config/db')

const app = express()

connectDB()

app.use(cors())
app.use(express.json())

// routes (เพิ่มทีหลัง)
// app.use('/api/orders', require('./routes/orders'))
// app.use('/api/upload', require('./routes/upload'))

app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})