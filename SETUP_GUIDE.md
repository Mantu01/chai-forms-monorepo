# Chai Forms Monorepo - Setup Guide

Welcome to the Chai Forms monorepo! This guide will help you get started with development.

## 📋 Prerequisites

- **Node.js**: v18+ (check with `node --version`)
- **pnpm**: v9.0.0+ (check with `pnpm --version`)
  - Install pnpm: `npm install -g pnpm`
- **Git**: For version control
- **PostgreSQL** (optional): For database features (currently using dummy connection)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd chai-forms-monorepo
pnpm install
```

This will install all dependencies for the entire monorepo including all apps and packages.

### 2. Start Development Server

```bash
pnpm dev
```

This starts all services in development mode:
- **Web App**: http://localhost:3000 (Next.js)
- **API Server**: http://localhost:5000 (Express + tRPC)
- **API Docs**: http://localhost:5000/docs
- **Database**: Ready for migrations

The console will show real-time logs from all services.

## 📦 Project Structure

```
chai-forms-monorepo/
├── apps/
│   ├── api/                 # Express.js + tRPC API server
│   │   ├── src/
│   │   │   ├── index.ts    # Server entry point
│   │   │   └── server.ts   # Express configuration
│   │   ├── .env            # API environment variables
│   │   └── env.ts          # Environment validation
│   └── web/                 # Next.js frontend
│       ├── app/            # Next.js app router
│       ├── components/      # React components
│       ├── trpc/           # tRPC client configuration
│       ├── .env            # Frontend environment variables
│       └── .env.local      # Local overrides
├── packages/
│   ├── database/           # Drizzle ORM + database schema
│   │   ├── schema.ts       # Database schema definitions
│   │   ├── drizzle.config.ts  # Drizzle configuration
│   │   └── .env            # Database environment variables
│   ├── services/           # Business logic services
│   │   ├── user/           # User service
│   │   ├── clients/        # OAuth clients
│   │   └── env.ts          # Services environment validation
│   ├── trpc/               # tRPC router & procedures
│   │   ├── server/         # Server-side tRPC setup
│   │   ├── client/         # Client-side tRPC setup
│   │   └── routes/         # API route definitions
│   ├── logger/             # Logging utilities
│   └── typescript-config/  # Shared TypeScript configs
├── .env                    # Root environment variables
└── turbo.json              # Turbo monorepo configuration
```

## 🔧 Environment Configuration

### Root Environment (`.env`)

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/chai_forms"

# OAuth
GOOGLE_OAUTH_CLIENT_ID="your_client_id"
GOOGLE_OAUTH_CLIENT_SECRET="your_client_secret"
GOOGLE_OAUTH_REDIRECT_URI="http://localhost:5000/auth/callback"

# API
PORT=5000
NODE_ENV="development"
BASE_URL="http://localhost:5000"
NEXT_PUBLIC_API_URL="http://localhost:5000"
```

### Web App Environment (`apps/web/.env.local`)

```env
NEXT_PUBLIC_API_URL="http://localhost:5000"
```

### API Environment (`apps/api/.env`)

```env
PORT=5000
NODE_ENV="development"
BASE_URL="http://localhost:5000"
GOOGLE_OAUTH_CLIENT_ID="your_client_id"
GOOGLE_OAUTH_CLIENT_SECRET="your_client_secret"
GOOGLE_OAUTH_REDIRECT_URI="http://localhost:5000/auth/callback"
```

### Database Environment (`packages/database/.env`)

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/chai_forms"
```

## 📚 Available Commands

### Development

```bash
# Start development server (all services)
pnpm dev

# Start specific service
pnpm --filter @repo/api dev      # API server only
pnpm --filter web dev             # Frontend only
```

### Building

```bash
# Build all packages
pnpm build

# Build specific package
pnpm --filter @repo/api build
```

### Database

```bash
# Generate database migrations
pnpm db:generate

# Run pending migrations
pnpm db:migrate
```

### Linting & Type Checking

```bash
# Run ESLint
pnpm lint

# Check TypeScript types
pnpm check-types

# Format code
pnpm format
```

## 🏗️ Architecture Overview

### Frontend (Next.js + tRPC + React Query)

- **Framework**: Next.js 16.1.0 with Turbopack
- **API Integration**: tRPC with React Query
- **UI Components**: Radix UI + shadcn/ui
- **Styling**: Tailwind CSS
- **State Management**: React Query + React hooks

The frontend communicates with the API through tRPC endpoints at `http://localhost:5000/trpc`.

### Backend (Express + tRPC)

- **Framework**: Express.js
- **API**: tRPC for type-safe API calls
- **ORM**: Drizzle ORM
- **Database**: PostgreSQL
- **Documentation**: OpenAPI via scalar

The API exposes:
- `/trpc` - tRPC endpoints (used by frontend)
- `/api` - OpenAPI endpoints
- `/docs` - API documentation
- `/health` - Health check
- `/openapi.json` - OpenAPI schema

### Database (Drizzle ORM + PostgreSQL)

- **ORM**: Drizzle ORM (v0.45.1)
- **Migrations**: Drizzle Kit
- **Schema**: Type-safe database schema
- **Database**: PostgreSQL 15

## 🔐 Authentication

The project supports Google OAuth. To enable it:

1. Get OAuth credentials from [Google Cloud Console](https://console.cloud.google.com)
2. Set environment variables:
   - `GOOGLE_OAUTH_CLIENT_ID`
   - `GOOGLE_OAUTH_CLIENT_SECRET`
   - `GOOGLE_OAUTH_REDIRECT_URI`

For development, dummy values are pre-configured.

## 🚨 Troubleshooting

### Port Already in Use

If port 3000 or 5000 is already in use:

```bash
# Find and kill the process
# On Windows: taskkill /PID <pid> /F
# On Linux/Mac: kill -9 <pid>

# Or use different ports:
# Modify turbo.json or individual package.json scripts
```

### Dependencies Issues

```bash
# Clear cache and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Database Connection Issues

- Ensure PostgreSQL is running
- Check `DATABASE_URL` in `.env` files
- For Docker: `docker-compose up -d` (if configured)
- For now, database is optional - app runs without it

### Frontend Errors

If seeing `TRPCClientError` with HTML response:
- Check that API server is running on port 5000
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check browser console for CORS issues

## 📝 Development Workflow

### Adding a New API Route

1. Create a procedure in `packages/trpc/server/routes/`
2. Add it to `packages/trpc/server/index.ts`
3. Frontend automatically gets types!

Example:
```typescript
// packages/trpc/server/routes/example.ts
export const exampleRouter = router({
  hello: publicProcedure.query(() => "Hello!"),
});

// packages/trpc/server/index.ts
export const serverRouter = router({
  example: exampleRouter,
});
```

Use in frontend:
```typescript
// apps/web components
const { data } = trpc.example.hello.useQuery();
```

### Adding Database Schema

1. Update `packages/database/schema.ts`
2. Generate migration: `pnpm db:generate`
3. Run migration: `pnpm db:migrate`

## 🔄 Monorepo Commands with pnpm

```bash
# Run command in all packages
pnpm -r run <script>

# Run in specific package
pnpm --filter @repo/api run <script>
pnpm --filter web run <script>

# Add dependency to specific package
pnpm --filter web add <package>

# Remove dependency
pnpm --filter web remove <package>
```

## 📚 Documentation

- [tRPC Documentation](https://trpc.io/)
- [Next.js Documentation](https://nextjs.org/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Express.js Documentation](https://expressjs.com/)
- [Turbo Documentation](https://turbo.build/)

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Run linting: `pnpm lint`
4. Check types: `pnpm check-types`
5. Commit: `git commit -m "feat: your feature"`
6. Push: `git push origin feature/your-feature`
7. Create a Pull Request

## ⚙️ Configuration Files

- **`turbo.json`**: Monorepo task definitions
- **`pnpm-workspace.yaml`**: Workspace configuration
- **`package.json`**: Root dependencies and scripts
- **`.npmrc`**: npm registry configuration
- **`prettier.config.js`**: Code formatting rules
- **`tsconfig.json` (various)**: TypeScript configurations

## 🎯 Current Status

✅ **Fully Operational**
- Frontend: Next.js running on port 3000
- API Server: Express + tRPC running on port 5000
- tRPC communication: Functional
- Database: Ready for setup

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review individual package README files
3. Check console logs for detailed errors
4. Review environment variable configuration

---

**Happy Coding!** 🚀

Last Updated: May 22, 2026
