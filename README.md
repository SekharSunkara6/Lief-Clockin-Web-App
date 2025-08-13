# 🚀 Lief Clock‑in Web App

A **Next.js** + **Prisma** + **Supabase** + **Auth0**–powered time tracking application with clock‑in/out, geofencing, and staff management — deployed on **Vercel**.

🌐 **Live App:** [https://lief-clockin-web-app-7dge.vercel.app/](https://lief-clockin-web-app-7dge.vercel.app/)

***

## 📦 Tech Stack
- **Next.js** – Fullstack React framework (SSR + API Routes)
- **Prisma ORM** – Modern ORM for PostgreSQL
- **Supabase** – Hosted PostgreSQL with authentication & RLS
- **Auth0** – Authentication & SSO integration
- **Vercel** – Deployment & serverless hosting

***

## ⚡ Requirements
- Node.js **v18+**
- npm / yarn / pnpm
- Supabase Project (PostgreSQL)
- Auth0 Application
- Vercel Account

***

## 🔧 Local Development Setup

### 1️⃣ Clone the repository
```bash
git clone 
cd 
```

### 2️⃣ Install dependencies
```bash
npm install
```

### 3️⃣ Configure environment variables  
Create a `.env` file in your project root:

```env
# ========= DATABASE =========
# Use Supabase Transaction Pooler connection string (PgBouncer, port 6543)
# Get it from Supabase → Project → Settings → Database → "Connection Pooling" → Transaction pooler
DATABASE_URL=postgresql://postgres.:@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true

# ========= AUTH0 =========
AUTH0_SECRET=your-random-secret-string
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=https://
AUTH0_CLIENT_ID=
AUTH0_CLIENT_SECRET=
```
💡 **Important:**  
- For **serverless** (Vercel) always use the **Transaction Pooler** string, not the default (`5432`) direct connection.
- URL‑encode your DB password (replace special characters like `@`, `#`, `$` with `%40`, `%23`, `%24`).

***

### 4️⃣ Generate Prisma Client
```bash
npx prisma generate
```

### 5️⃣ Apply database migrations
```bash
npx prisma migrate dev
```
(For production, use `npx prisma migrate deploy`)

***

### 6️⃣ Start the development server
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

***

## 📜 Prisma Singleton Pattern
We use a **singleton** to avoid multiple database connections in serverless environments.

`src/lib/prisma.ts`
```ts
import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

export default prisma;
```
✅ Always import Prisma from this file in API routes:
```ts
import prisma from '../../lib/prisma';
```

***

## 🌐 Deployment on Vercel

### 1. Push Code to GitHub
Push your code to a GitHub repository.

### 2. Import Project into Vercel
Import it from Vercel’s dashboard.

### 3. Set Environment Variables (Production)
In **Vercel → Settings → Environment Variables**:
- Paste the `.env` values above.
- Ensure `DATABASE_URL` is set to **Transaction Pooler** string.
- Select **Production** scope.

### 4. Update Build Scripts
In `package.json`:
```json
"scripts": {
  "dev": "next dev",
  "build": "prisma generate && next build",
  "start": "next start",
  "postinstall": "prisma generate"
}
```

### 5. Redeploy with Cache Cleared
- Trigger a new deploy in Vercel
- **Clear build cache** so Prisma uses the updated `DATABASE_URL`

***

## 🧪 Testing DB Connection in Production
(Useful after updating DB string.)

**Temporary API route:** `src/pages/api/test-db.ts`
```ts
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const userCount = await prisma.user.count();
    res.status(200).json({ userCount });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
}
```
Deploy → Visit:
```
https:///api/test-db
```
- ✅ Returns `{"userCount": N}` if connected.
- ❌ Returns an error if DB connection fails.

**Remove this route** after testing for security.

***

## 🔒 Security Recommendations
- Enable **Row Level Security (RLS)** for all relevant Supabase tables.
- Create policies to allow access only to authenticated users.
- Never commit `.env` files or secrets to version control.
- Remove test/debug API routes from production.

***

## 🐛 Troubleshooting

**"Can't reach database server" on Vercel**  
- Ensure you’re using the **Transaction Pooler** connection string (port 6543).
- Update `DATABASE_URL` in **Production** env vars.
- Clear Vercel build cache and redeploy.

**Prisma Client errors after schema change**  
- Run `npx prisma generate` locally.
- Commit & redeploy with cache cleared.

**Auth0 login redirects fail locally**  
- Match `AUTH0_BASE_URL` to `http://localhost:3000`
- Add callback URLs in Auth0 dashboard for both local and production URLs.

***
