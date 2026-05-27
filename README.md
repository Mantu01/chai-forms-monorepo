## ChaiForm

ChaiForm is a form-building and form-sharing platform for teams. Create forms with AI, organize them inside workspaces, publish them with flexible access controls, and analyze results with a built-in dashboard.

## Product Features

### Dashboard & Analytics
- Analytics dashboard with workspace-level stats.
- Recent published forms and recent community activity.
- Interactive graph data (time range selection and grouping by workspace or form) to visualize submission trends.

### Workspace Management
- Create, update, and delete workspaces (by slug).
- Manage workspace members with roles:
  - `owner`, `admin`, `member`
- Workspace member details and role changes.

### Community Management
- Public community area where users can discover and interact with community-published items.
- Comment threads (nested replies supported via `parentId`).
- Community interactions are tied to published templates/forms and can be fetched/managed per user.

### Archived & Templates
- Forms can be published as templates and shared publicly.
- Templates can be:
  - Archived (moved to an archive list per user)
  - Unarchived
  - Cloned into another workspace (template cloning copies pages + fields + theme)
- Archive browsing and template cloning are first-class UI flows.

## Form Features

### AI Form Creation (Type Prompt -> Streamed Form)
- Create forms by typing a prompt using the Tambo AI-driven builder.
- The AI output can scaffold:
  - Multi-page structure
  - Form fields and layouts (streamed/configured in the UI)

### Multi-page Forms
- Forms are modeled as an ordered list of pages.
- Fields belong to pages (or can be created without a page).
- The submit UI navigates page-by-page using a `page` query parameter.

### Conditional Logic (Conditional Questioning)
- Fields support conditional visibility using:
  - `config.logic.showIf`
  - Supported operators:
    - `equals`
    - `not_equals`
    - `contains`
- Conditional visibility is evaluated both:
  - In the submit renderer (to determine which fields are visible/required)
  - In the submission service (to validate required/visible fields)

### Matrix Fields
- Matrix grid fields are supported:
  - Matrix rows (questions)
  - Matrix cols (ratings/options)
- The renderer builds input names per row/column to capture structured responses.

### Field Types Supported
ChaiForm supports a broad set of field types, including:
- `text`, `textarea`
- `email`
- `phone`
- `number`
- `select`, `multi_select`
- `radio`
- `checkbox`
- `date`, `time`
- `file` (base64 upload -> stored in Cloudinary, then rendered back)
- `rating`
- `matrix`
- `url`
- `signature` (supported in the field schema/types)

## Form Settings

### Access Level
Each published form supports an access level:
- `unlisted`: only shareable via link (not listed in the public directory)
- `public`: publicly accessible to anyone
- `private`: only accessible to workspace members

### Other Settings
- Submissions behavior:
  - `requireAuth` (optionally restricts access)
  - `allowMultipleSubmissions`
  - `maxSubmissions` (intended as submission limiting / throttling)
- Redirect after submission via `redirectUrl`

## Themeing (Default + Custom) with Banner
- Default theme presets (select from existing presets).
- Custom theming per form.
- Banner support:
  - Upload/select a `bannerUrl` to display a header/banner in the form UI.

## Workspace Member Invitation
- Owners/admins can invite members by email.
- Invitation flow:
  - A secure token is generated and stored with an expiry.
  - An invitation email is sent to the invitee.
  - The invite link directs users to `/notification`.
  - Users can accept or reject invites from the notification UI.
- Email notification errors are handled safely (logged without failing the invite request).

## Templates: Archive + Clone into Workspaces
- Templates can be archived by the owner.
- Archived templates can be unarchived.
- Cloning a template into a workspace creates a new draft form in the target workspace:
  - New form slug is generated
  - Pages and fields are copied
  - Theme configuration (including banner) is copied

## Plans: Basic and Pro

### Basic (Starter)
- Limited number of forms (Starter plan constraint in UI).
- Basic form fields.
- General community support.

### Pro (Professional)
- Unlimited form creation.
- Real-time AI form builder access.
- Conditional logic branching.
- Base64 file uploads storage (via Cloudinary).
- Advanced dashboard/analytics (telemetry logs dashboard in UI).
- Workspace RBAC permissions.

### Razorpay Integration Status + Referral Unlock
- Pro upgrades are implemented through Razorpay checkout:
  - `createOrder` calls Razorpay order creation
  - `verifyPayment` verifies payment signature (or accepts mock in offline/mock mode)
- If Razorpay checkout is not available or the environment is offline/mock:
  - Pro upgrade can still be simulated in the UI and verified server-side using mock order ids.
- Pro can also be enabled during signup by providing a referral code:
  - Backend checks referral code during signup and sets `isSubscribed`.

## Email Notifications (Invitations + Submissions)

ChaiForm sends system notification emails for:
- **Workspace invitations** (invite acceptance flow via token link)
- **Form submissions** (email sent to the form creator/workspace owner)

Implementation notes:
- Uses `nodemailer` for SMTP-based delivery.
- Mail templates generate HTML for each notification type.
- Submission/invitation email failures are caught and logged so the primary action (invite/submission) still succeeds.

## Rate Limiting / Submission Limiting
- Form-level submission limiting is supported in the data model:
  - `allowMultipleSubmissions`
  - `maxSubmissions`
- This is intended to control “submission rate” and enforce caps per form configuration.

## Caching with Redis
- Redis is used to cache high-read public endpoints to improve performance:
  - Public form fetch by slug (`public:form:slug:<slug>`) with TTL (~1 hour)
  - Public templates list (`public:templates`) with TTL (~5 minutes)
  - Archived templates list per user (`archived:templates:<userId>`) with TTL (~5 minutes)
- Cache invalidation is performed on:
  - Form publish/update/delete actions
  - Template archive/unarchive actions

## Tech Stack

### Monorepo Tooling
- `pnpm` (workspace-managed packages)
- `turbo` (build/dev orchestration and pipelines)
- `prettier` + Turbo tasks (lint, typecheck, format)

### Web App
- Next.js `16.1.0` (App Router)
- React `19.2.0`
- TypeScript `5.9.x`
- UI & styling:
  - Tailwind CSS `4.x`
  - Radix UI components
  - DnD Kit for drag/drop
  - TipTap for rich text editing
  - Recharts for analytics graphs
  - Sonner for toasts
  - next-themes for theming support
- Data/API:
  - tRPC React Query integration
  - Zod for runtime validation (shared schemas across the stack)

### API (Backend)
- Express `5.2.x`
- tRPC server (`@trpc/server`)
- CORS (`cors`) with cookie credentials support
- Multer (`multer`) for multipart uploads (e.g. workspace logo upload)
- Zod schema validation for all router inputs/outputs
- API documentation:
  - OpenAPI generation via `trpc-to-openapi`
  - Scalar API reference UI at `/docs`

### Database & Storage
- PostgreSQL (via Docker in `docker-compose.yml`)
- Drizzle ORM (`drizzle-orm`) with `drizzle-kit` migrations
- Cloudinary for file/image uploads

### Auth
- Google OAuth (OAuth2 client)
- Session token stored in an HTTP-only cookie (`cookie`)
- tRPC-protected routes for authenticated UX flows
- Signup/login supports referral codes to enable Pro

### Email
- `nodemailer` with configurable provider (SMTP in dev, production transport supported)

### Caching
- Redis via `ioredis`
- Optional Redis behavior (the app keeps running if Redis is unavailable)

## Monorepo Setup Guide

### 1. Start dependencies (Postgres + Redis)
- Run:
  - `docker compose up -d`
- Services:
  - `postgresdb` (Postgres 15)
  - `redis` (Redis 7-alpine)
  - `redis-insight` (UI for Redis inspection)

### 2. Environment variables
The repo is designed to run with env files for:
- `apps/web`
- `apps/api`
- shared packages under `packages/`

You mentioned you will provide an `env.sample`. Use it to create env files in the following places:

1. `apps/web/.env.local` (Next.js environment)
2. `apps/api/.env` (Express + API environment)
3. `packages/database/.env` (DB connection)
4. `packages/services/.env` (OAuth/email/Cloudinary environment)

Also ensure these variables exist where required by code:
- Database:
  - `DATABASE_URL` (Postgres connection string)
- API:
  - `BASE_URL` (defaults to `http://localhost:8000` if not set)
  - `NODE_ENV` (development/production)
- Email:
  - `MAIL_USERNAME`, `MAIL_PASSWORD`
  - `MAIL_SERVICE`, `MAIL_PROVIDER`, `MAIL_PORT`
- Google OAuth:
  - `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`, `GOOGLE_OAUTH_REDIRECT_URI`
- Cloudinary:
  - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- Redis:
  - `REDIS_URL`
- App URL used when generating workspace invite links:
  - `NEXT_PUBLIC_APP_URL`

### 3. Install + run
- Install dependencies:
  - `pnpm install`
- Run the full dev environment:
  - `pnpm dev`
- Run database migrations/updates (drizzle):
  - `pnpm db:push`
- Seed database (if required by your workflow):
  - `pnpm --filter @repo/database db:seed`

### 4. Optional: setup script
- There is a `setup.sh` helper that expects an env template and wires env files into app/package directories.

## Folder Structure (High-level)
- `apps/web`: Next.js UI (forms, dashboard, workspace management, community)
- `apps/api`: Express API bootstrap + health + OpenAPI + route mounts
- `packages/trpc`: shared tRPC server router implementations and helpers (including Redis caching util)
- `packages/services`: business logic (users, workspaces, forms, submissions, billing, dashboard, mailers)
- `packages/database`: database models, schema, and Drizzle migrations/queries
- `packages/logger`: logging utilities

## System Flows (End-to-End)

1. Authentication
   - Google OAuth callback (`/auth/callback`) -> `userService.handleGoogleCallback`
   - Optional referral code unlock on user creation during signup
   - tRPC `auth.me` provides logged-in user state
   - Protected routes are gated server-side via cookie/session checks

2. Workspace Invitation
   - Workspace owner/admin calls `workspace.inviteMember` with:
     - `workspaceId`, `email`, `role`
   - Backend generates an invite token + expiry and sends an email
   - Invite link directs to `/notification`
   - User accepts:
     - `workspace.acceptInvite` -> adds workspace member + marks invite accepted

3. Form Creation (AI -> Multi-page -> Conditional)
   - User navigates to the form create flow
   - Enters a prompt; Tambo AI scaffolds:
     - pages + fields
     - config for conditional visibility
   - User can further edit:
     - field types (including matrix)
     - conditional logic operators (`equals`, `not_equals`, `contains`)

4. Form Settings -> Publishing -> Templates
   - User sets access level:
     - unlisted / public / private
   - User sets theme:
     - default theme preset or custom colors + bannerUrl
   - User publishes the form:
     - optionally marks it as a template for public cloning
   - Template listing:
     - public templates directory uses Redis caching

5. Archived Templates and Cloning
   - User archives a template:
     - it is stored as archived for that user
   - User can unarchive or clone into another workspace:
     - cloning copies pages, fields, and theme into a new draft

6. Community Interaction
   - Public users explore community forms/templates
   - Comments can be created as nested threads (parent-child)
   - Users can view community interactions for specific public items

7. Submission Flow (Render -> Validate -> Store -> Notify)
   - User opens `form/[slug]/submit`
   - Client enforces visibility rules for each field (showIf logic)
   - On submit:
     - files are uploaded (base64 -> Cloudinary via API)
     - submission request is sent to `submission.createSubmission`
   - Backend:
     - validates visible required fields based on conditional logic
     - stores answers in the database
     - sends a submission notification email to the form creator
   - Client shows success state and optional redirect

8. Billing and Pro Upgrade
   - UI calls `billing.createOrder(amount)`
   - Checkout script loads Razorpay checkout when available
   - Payment handler calls `billing.verifyPayment(...)`
   - If offline/mock:
     - server accepts mock order ids/signatures and upgrades `isSubscribed`
   - Signup can also unlock Pro by referral code

9. Performance and Caching Flow (Redis)
   - Public form fetch by slug checks Redis first
   - Public/archived templates list checks Redis first
   - Mutations that change visibility publish/archive status invalidate relevant cache keys

