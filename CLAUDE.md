# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Fired Chicken Accounting is a Thai-language accounting system for a fried chicken restaurant. It tracks income from multiple sales channels (in-store, GrabFood, LINE MAN) and various expense categories, with automatic platform fee calculation for delivery app orders.

## Commands

```bash
# Development
npm run dev          # Start Next.js dev server

# Build
npm run build        # Production build
npm run lint         # Run ESLint

# Database
npm run db:generate  # Generate Prisma client after schema changes
npm run db:push      # Push schema changes to database
npm run db:studio    # Open Prisma Studio GUI
npm run db:seed      # Seed database with admin user
```

## Architecture

### Tech Stack
- Next.js 14 with App Router
- TypeScript
- Prisma ORM with PostgreSQL
- Tailwind CSS
- Recharts for data visualization
- Zod for API validation
- NextAuth.js v5 for authentication

### Authentication & Security

**Authentication** (`src/lib/auth.ts`):
- NextAuth.js v5 with Credentials provider
- JWT-based sessions (30 day expiry)
- Login page at `/login`
- Default admin: `admin@firedchicken.com` / `admin123`

**Middleware** (`middleware.ts`):
- Protects all routes except `/login`, `/api/auth`, `/api/health`
- Rate limiting: 100 requests/minute per IP
- Redirects unauthenticated users to login

**Security Headers** (`next.config.js`):
- HSTS, X-Frame-Options, CSP, etc.

### Key Patterns

**API Routes** (`src/app/api/`):
- All routes protected by middleware (require authentication)
- Query parameters validated with Zod schemas
- Pagination support on list endpoints (default 50, max 100)
- Returns `{ data: [], pagination: { page, limit, total, totalPages } }`

**Platform Fee Calculation** (`src/lib/utils.ts`):
- Rates configured via environment variables
- GrabFood and LINE MAN: configurable fee rate (default 30%)
- Stores gross amount, fee, and net amount

**Database Models** (`prisma/schema.prisma`):
- `User`: Authentication with email/password and role (USER/ADMIN)
- `Income`: Revenue tracking with platform fee fields
- `Expense`: Cost tracking by category

**Utilities** (`src/lib/`):
- `env.ts`: Environment variable validation with Zod
- `utils.ts`: Formatting, calculations, validation schemas
- `logger.ts`: Structured logging (JSON in production)
- `api-auth.ts`: Auth helpers for API routes

### Environment Variables

Required in `.env`:
```
POSTGRES_PRISMA_URL=postgresql://...
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
```

Optional:
```
GRAB_FOOD_FEE_RATE=30
LINE_MAN_FEE_RATE=30
APP_VERSION=1.0.0
```

### Health Check

`GET /api/health` returns:
- Database connectivity status
- Environment info
- HTTP 200 if healthy, 503 if unhealthy
