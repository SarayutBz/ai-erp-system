require('dotenv').config()
const express = require('express')
const cors = require('cors')
const connectDB = require('./config/db')

const app = express()

connectDB()

// production: allow frontend domain
// development: allow all
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [process.env.FRONTEND_URL]
  : ['http://localhost:5173']

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
}))

app.use(express.json())

app.use('/api/orders', require('./routes/orders'))
app.use('/api/upload', require('./routes/upload'))
app.use('/api/logs',   require('./routes/logs'))

app.get('/health', (req, res) => {
  res.json({ status: 'ok', env: process.env.NODE_ENV })
})

// global error handler
app.use((err, req, res) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Internal server error' })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} [${process.env.NODE_ENV}]`)
})