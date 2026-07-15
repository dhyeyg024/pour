# 🥤 POUR — Protein Water App

A Next.js e-commerce application for the POUR protein water brand with OTP-based email authentication, Razorpay payments, and a Neon PostgreSQL database.

---

## 📋 Prerequisites

Install the following **before** cloning the project:

| Tool | Version | Download |
|------|---------|----------|
| Node.js | `v20+` (LTS) | https://nodejs.org |
| npm | Comes with Node | — |
| Git | Latest | https://git-scm.com |

> **Verify your installs** by running:
> ```bash
> node -v
> npm -v
> git --version
> ```

---

## 🚀 Setup Steps

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd i-w
```

> If you don't have a Git remote, just **copy the project folder** to your new laptop and `cd` into it.

---

### 2. Install Dependencies

```bash
npm install
```

This installs everything from `package.json` including:
- `next`, `react`, `react-dom`
- `next-auth` (v5 beta) + `@auth/prisma-adapter`
- `prisma` + `@prisma/client` + `@neondatabase/serverless`
- `razorpay` (payment gateway)
- `resend` (OTP email service)
- `gsap` + `lucide-react` (animations & icons)
- `bcryptjs`, `dotenv`, `tsx`, `typescript`

---

### 3. Set Up Environment Variables

Create a `.env` file in the **root of the project** (same level as `package.json`) with the following content:

```env
# ── Database (Neon PostgreSQL) ────────────────────────────────────────────────
DATABASE_URL="postgresql://neondb_owner:npg_N1SpD2Tardvu@ep-dark-grass-atxtqk6t-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://neondb_owner:npg_N1SpD2Tardvu@ep-dark-grass-atxtqk6t.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require"

# ── NextAuth ──────────────────────────────────────────────────────────────────
NEXTAUTH_SECRET="pour-protein-water-nextauth-secret-key-d3v-2024"
NEXTAUTH_URL="http://localhost:3000"

# ── Razorpay (Test Mode) ──────────────────────────────────────────────────────
RAZORPAY_KEY_ID=rzp_test_TCtDcORaPP7FQG
RAZORPAY_KEY_SECRET=iJ72f7k0bjh99uENtRAFH1pr

# ── Resend (Email OTP) ────────────────────────────────────────────────────────
RESEND_API_KEY=re_ds34LYAd_8fGTjbUD7divkav5m1nC7ncs
```

> **⚠️ Important:** The database is hosted on [Neon](https://neon.tech) (cloud PostgreSQL). You do NOT need to install a local database — it connects over the internet using the URLs above.

---

### 4. Generate Prisma Client

```bash
npx prisma generate
```

This generates the type-safe Prisma database client from the schema. **Run this every time the schema changes.**

---

### 5. Apply Database Migrations (if needed)

The database schema is already applied on Neon. But if you want to push any new schema changes:

```bash
npm run db:migrate
```

Or to just push the schema without creating a migration file:

```bash
npx prisma db push
```

---

### 6. (Optional) Seed the Database

To populate the database with the initial product data (guava-chilli, raw-mango, watermelon):

```bash
npm run db:seed
```

> **Note:** Only run this once. Running it again may create duplicate entries.

---

### 7. Run the Development Server

```bash
npm run dev
```

Open your browser and go to: **http://localhost:3000**

---

## 🗂️ Project Structure

```
i-w/
├── app/                    # Next.js App Router pages & API routes
│   ├── api/
│   │   ├── auth/
│   │   │   ├── send-otp/   # POST: generates & emails a 6-digit OTP via Resend
│   │   │   └── [...nextauth]/ # NextAuth.js handler
│   │   ├── cart/           # Cart CRUD endpoints
│   │   ├── orders/         # Order creation & listing
│   │   └── payments/       # Razorpay order creation & verification
│   ├── login/              # Login page (email + OTP flow)
│   └── page.tsx            # Home / landing page
├── auth.ts                 # NextAuth v5 config (OTP credentials provider)
├── components/             # Reusable React components
│   ├── CheckoutModal.tsx   # Checkout flow with Razorpay payment
│   └── ...
├── lib/
│   └── db.ts               # Prisma client singleton
├── prisma/
│   ├── schema.prisma       # Database schema (User, Cart, Order, Product, etc.)
│   └── seed.ts             # Seed script for initial products
├── types/                  # TypeScript type definitions
├── .env                    # Environment variables (create this manually — see Step 3)
├── next.config.mjs         # Next.js configuration
└── package.json            # Dependencies & scripts
```

---

## 🔑 Key Services & Credentials

| Service | Purpose | Console |
|---------|---------|---------|
| **Neon** | Cloud PostgreSQL database | https://console.neon.tech |
| **Resend** | Sends OTP emails | https://resend.com |
| **Razorpay** | Payment gateway (test mode) | https://dashboard.razorpay.com |

---

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server at `localhost:3000` |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed` | Seed database with products |
| `npm run db:studio` | Open Prisma Studio (visual DB browser) |

---

## 🔐 Authentication Flow

The app uses **Email OTP login** (no passwords):

1. User enters their **email address** on `/login`
2. A **6-digit OTP** is generated and sent to their email via **Resend**
3. User enters the OTP, which is verified against the database
4. If valid, the user is logged in and a **JWT session** is created via NextAuth v5

> **⚠️ Resend Testing Limitation:** In Resend's free tier, OTP emails can only be sent to `gandhidhyey1221@gmail.com` (the account's registered email). To send to other emails, a custom domain must be verified at https://resend.com/domains.

---

## 💳 Payment Flow (Razorpay Test Mode)

1. User adds items to cart and proceeds to checkout
2. App creates a **Razorpay order** via `/api/payments/create-order`
3. Razorpay checkout SDK opens in browser
4. On payment, signature is **verified server-side** at `/api/payments/verify`
5. Order is saved to the database as `CONFIRMED`

**Test card for Razorpay:**
- Card Number: `4111 1111 1111 1111`
- Expiry: Any future date
- CVV: Any 3 digits

---

## 🛠️ Troubleshooting

### `Error: Can't reach database server`
- Check your internet connection (Neon is a cloud DB)
- Verify the `DATABASE_URL` in your `.env` file is correct

### `PrismaClientInitializationError`
- Run `npx prisma generate` again

### `Module not found` errors
- Run `npm install` again

### OTP email not received
- Check spam folder
- Remember: Resend free tier only sends to the registered account email (`gandhidhyey1221@gmail.com`)

### Port 3000 already in use
- Change the port: `npm run dev -- -p 3001`
