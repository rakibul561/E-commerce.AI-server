# 🚀 AI-Powered Product Content Generator — Backend

A **scalable, production-grade backend system** built with **Node.js, Express.js, TypeScript, Prisma, and MongoDB**, designed to power an **AI-driven product content automation platform**.

This backend handles **AI content generation, media processing, subscriptions & credits, secure authentication, exports, and admin analytics**, following clean architecture and industry best practices.

---

## 🧠 Core Responsibilities

* AI-powered product content generation
* Image & video processing pipelines
* Subscription & credit-based usage management
* Secure authentication & authorization
* Admin monitoring & analytics
* Cloud storage & export integrations

---

## 📮 API Documentation

📌 **Postman Collection:**
[https://documenter.getpostman.com/view/46499415/2sBXVZnDio](https://documenter.getpostman.com/view/46499415/2sBXVZnDio)

---

## 🧩 Tech Stack

### Backend

* **Node.js**
* **Express.js**
* **TypeScript**

### Database

* **MongoDB**
* **Prisma ORM**

### AI & Media

* **OpenAI** (text generation)
* Computer Vision API (image analysis)
* AI Image Generation
* AI Video Synthesis

### Payments

* **Stripe Subscriptions**
* Credit-based usage enforcement

### Storage

* **Cloudinary**

### Authentication & Security

* JWT Authentication (Access & Refresh Tokens)
* Role-based Access Control (User / Admin)
* Rate Limiting
* Helmet & CORS

---

## ✨ Feature Overview

### 🔹 Core AI Capabilities

* Generate **product titles, descriptions, and SEO tags** from a single image
* Detect **product category & type** using computer vision
* Learn and replicate **user-specific writing styles**
* Smart **keyword & tag generation**

### 🖼️ AI Image & Video

* Search & fetch **copyright-free product images**
* AI image generation fallback
* YouTube product video search & preview
* AI-generated short product videos (2–3 minutes)

### 📦 Data Management

* Export product data compatible with **Shopify & WooCommerce**
* Secure cloud storage for generated content

### 👤 User & Subscription

* User dashboard with generation history
* Credit & subscription tracking
* Stripe plans: **Basic / Pro / Enterprise**
* Credit-based AI usage limits

### 🛠️ Admin & Analytics

* Admin dashboard
* User & subscription management
* AI usage & system analytics

---

## 🔐 Test Credentials (Development Only)

> ⚠️ **For testing purposes only**

**User**

```json
{
  "email": "nayeem2@gmail.com",
  "password": "Nayeem123$"
}
```

**Admin**

```json
{
  "email": "admin@gmail.com",
  "password": "admin123$"
}
```

---

## 📁 Project Structure

```
src/
│
├── app.ts
├── server.ts
│
├── modules/
│   ├── auth/
│   ├── user/
│   ├── ai/
│   ├── product/
│   ├── subscription/
│   ├── payment/
│   ├── export/
│   ├── admin/
│
├── utils/
│   ├── catchAsync.ts
│   ├── sendResponse.ts
│   ├── cloudStorage.ts
│
├── middlewares/
│   ├── auth.ts
│   ├── rateLimiter.ts
│
├── config/
│   ├── index.ts
│
└── routes/
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone Repository

```bash
git clone https://github.com/rakibul561/E-commerce.AI-server.git
cd E-commerce.AI-server
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Environment Configuration

Create a `.env` file (see `.env.example`):

```env
PORT=5000
DATABASE_URL=

# JWT
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=

# AI
OPENAI_API_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### 4️⃣ Run Development Server

```bash
npm run dev
```

### 5️⃣ Build for Production

```bash
npm run build
npm start
```

---

## 🔐 Authentication Flow

* JWT-based authentication
* Access & Refresh tokens
* Role-based authorization (User / Admin)

---

## 💳 Subscription & Credit Logic

* Each subscription has monthly credit limits
* AI operations consume credits
* Requests are blocked when credits are exhausted
* Stripe webhooks handle:

  * Renewals
  * Upgrades / downgrades
  * Cancellations

---

## 📤 Export Support

* JSON & CSV formats
* Shopify & WooCommerce compatible exports

---

## 📊 Admin Capabilities

* View and manage users
* Monitor AI usage
* Track subscriptions & revenue
* Moderate platform content

---

## 🧪 API Documentation

* Postman Collection (included)
* Swagger support (optional / extensible)

---

## 🚀 Future Roadmap

* Team-based workspaces
* Multi-language AI generation
* AI A/B testing
* Webhook-based automation
* Advanced analytics & reporting

---


