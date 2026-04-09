# ⚡ AI ERP System

> An intelligent ERP (Enterprise Resource Planning) demo system that leverages **Google Gemini AI** to automate invoice parsing and order management. Users can create orders manually via forms or upload invoice images/PDFs — the AI automatically extracts structured data and feeds it through a normalization pipeline into MongoDB.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (Vue 3)                        │
│                                                                 │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐   │
│  │ Dashboard │  │ New Order │  │  Upload   │  │   Logs    │   │
│  │   Page    │  │   Page    │  │   Page    │  │   Page    │   │
│  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘   │
│        │              │              │              │           │
│        └──────────────┴──────┬───────┴──────────────┘           │
│                              │                                  │
│                     Pinia API Store                             │
│                       (api.js)                                  │
└──────────────────────────────┬──────────────────────────────────┘
                               │  HTTP (REST API)
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│                       Backend (Express)                          │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    API Routes                             │   │
│  │  /api/orders    /api/upload    /api/logs                  │   │
│  └────────┬──────────────┬──────────────┬────────────────────┘   │
│           │              │              │                        │
│           ▼              ▼              ▼                        │
│  ┌────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │ Normalizer │  │ Gemini AI    │  │  Aggregation │            │
│  │  Pipeline  │◄─┤  Service     │  │  & Filtering │            │
│  └──────┬─────┘  └──────────────┘  └──────────────┘            │
│         │                                                       │
│         ▼                                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    MongoDB Models                         │   │
│  │  Customer  │  Order  │  RawInput  │  AuditLog             │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────────┬───────────────────────────────────┘
                               │
                               ▼
                     ┌──────────────────┐
                     │     MongoDB      │
                     └──────────────────┘
```

---

## 🔄 System Workflow

### 1. Manual Order (Form Input)

```
User fills form  →  POST /api/orders  →  Normalizer Pipeline  →  Validate
                                                                     │
                     ┌───────────────────────────────────────────────┘
                     ▼
              Create/Find Customer  →  Create Order  →  Audit Log  →  Response
```

### 2. Invoice Upload (AI-Powered)

```
User uploads file  →  POST /api/upload  →  Multer saves file
                                                │
                                                ▼
                                        Gemini AI parses
                                       invoice (base64)
                                                │
                                                ▼
                                     Normalizer Pipeline  →  Validate
                                                                │
                     ┌──────────────────────────────────────────┘
                     ▼
              Create/Find Customer  →  Create Order  →  Audit Log  →  Cleanup file
```

### 3. Data Flow Through Pipeline

| Step | Action | Description |
|------|--------|-------------|
| 1 | **Raw Input Saved** | Every input (form/upload) is stored as `RawInput` before processing |
| 2 | **Source Detection** | Pipeline identifies the source type (`form` / `upload`) |
| 3 | **Normalization** | Transforms varying field names into a unified schema |
| 4 | **Validation** | Ensures required fields exist (customer name, items, qty > 0) |
| 5 | **Customer Upsert** | Finds existing customer by name or creates a new one |
| 6 | **Order Creation** | Creates order with auto-calculated `totalAmount` |
| 7 | **Audit Trail** | Every step is logged in `AuditLog` for traceability |

---

## ✨ Features

- **📝 Manual Order Entry** — Create orders via structured form with customer info and line items
- **📄 AI Invoice Parsing** — Upload invoice images (JPEG, PNG, WebP) or PDFs, Gemini AI extracts structured data automatically
- **🔄 Normalization Pipeline** — Unified data processing pipeline that handles multiple input sources and normalizes them into a consistent schema
- **📊 Dashboard** — Overview of orders and pipeline health with aggregated statistics
- **📋 Audit Logs** — Complete traceability of every action with filtering, pagination, and per-job timeline tracking
- **🔍 Pipeline Status** — Real-time monitoring of processing status grouped by source (form/upload) and status (done/error)
- **🛡️ Error Handling** — Comprehensive error capture at every stage — raw input errors, normalization failures, and AI parsing errors are all logged and traceable
- **🧮 Auto Calculation** — Order totals are automatically computed via Mongoose pre-save hooks

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **Vue 3** | UI framework (Composition API + `<script setup>`) |
| **Vuetify 4** | Material Design component library |
| **Pinia** | State management |
| **Vue Router 5** | Client-side routing with lazy-loaded pages |
| **Vite 8** | Build tool and dev server |
| **MDI Icons** | Material Design Icons |

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime environment |
| **Express 5** | Web framework |
| **Mongoose 9** | MongoDB ODM |
| **Multer 2** | File upload handling |
| **Google Gemini API** | AI-powered invoice parsing (gemini-2.5-flash) |
| **dotenv** | Environment variable management |

### Infrastructure
| Technology | Purpose |
|------------|---------|
| **MongoDB** | Document database |
| **Render** | Cloud deployment platform |

---

## 📁 Project Structure

```
ai-erp-system/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                 # MongoDB connection
│   │   ├── models/
│   │   │   ├── AuditLog.js           # Action tracking & error logging
│   │   │   ├── Customer.js           # Customer info (name, email, phone)
│   │   │   ├── Order.js              # Order with items & auto-total
│   │   │   └── RawInput.js           # Raw data storage before normalization
│   │   ├── pipeline/
│   │   │   └── normalizer.js         # Data normalization & validation pipeline
│   │   ├── routes/
│   │   │   ├── logs.js               # GET /api/logs & pipeline-status endpoints
│   │   │   ├── orders.js             # POST/GET /api/orders
│   │   │   └── upload.js             # POST /api/upload (invoice parsing)
│   │   ├── services/
│   │   │   └── gemini.js             # Gemini AI invoice parser
│   │   └── index.js                  # Express app entry point
│   ├── uploads/                      # Temporary file storage (auto-cleaned)
│   ├── .env.example                  # Environment variables template
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── assets/                   # Static assets & CSS
│   │   ├── pages/
│   │   │   ├── DashboardPage.vue     # Overview & pipeline statistics
│   │   │   ├── LogsPage.vue          # Audit log viewer with filters
│   │   │   ├── OrderPage.vue         # Manual order creation form
│   │   │   └── UploadPage.vue        # Invoice upload & AI results
│   │   ├── router/
│   │   │   └── index.js              # Route definitions (lazy-loaded)
│   │   ├── stores/
│   │   │   └── api.js                # Pinia store — centralized API calls
│   │   ├── App.vue                   # Root layout with sidebar navigation
│   │   └── main.js                   # App bootstrap (Vue + Vuetify + Pinia)
│   ├── .env.local                    # Frontend env (VITE_API_URL)
│   └── package.json
│
├── test-files/
│   └── invoice.png                   # Sample invoice for testing upload
│
├── render.yaml                       # Render deployment config
└── .gitignore
```

---

## 🚀 Setup

### Prerequisites

- **Node.js** ≥ 20.19.0 or ≥ 22.12.0
- **MongoDB** (local or cloud via MongoDB Atlas)
- **Google Gemini API Key** — [Get one here](https://aistudio.google.com/apikey)

### 1. Clone the Repository

```bash
git clone https://github.com/SarayutBz/ai-erp-system.git
cd ai-erp-system
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Create `.env` from the template:

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
MONGO_URI=mongodb://localhost:27017/ai-erp
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000
```

Start the backend:

```bash
# Development (with hot-reload)
npm run dev

# Production
npm start
```

### 3. Setup Frontend

```bash
cd frontend
npm install
```

Create `.env.local` (optional — defaults to `http://localhost:3000/api`):

```env
VITE_API_URL=http://localhost:3000/api
```

Start the frontend:

```bash
npm run dev
```

### 4. Open the App

Navigate to **http://localhost:5173** in your browser.

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/orders` | Create order from form input |
| `GET` | `/api/orders` | List all orders (with customer populated) |
| `POST` | `/api/upload` | Upload invoice file for AI parsing |
| `GET` | `/api/logs` | Get audit logs (supports `?source=`, `?status=`, `?page=`, `?limit=`) |
| `GET` | `/api/logs/pipeline-status` | Aggregated pipeline health overview |
| `GET` | `/api/logs/pipeline-status/:id` | Timeline of a specific raw input job |
| `GET` | `/health` | Server health check |
