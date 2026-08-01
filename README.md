# Project File Uploader

A full-stack file storage and management app built as part of [The Odin Project](https://www.theodinproject.com/) Node.js curriculum. Users can sign up, log in, organize files into folders, upload files to cloud storage, and download them securely — with every resource scoped to its owner.

## Features

- **Authentication** — session-based auth with Passport.js (local strategy), passwords hashed with bcrypt
- **Persistent sessions** — sessions stored in Postgres via `@quixo3/prisma-session-store`, not in memory
- **Folders** — full CRUD, scoped per user
- **File uploads** — files uploaded via Multer and stored in a private Supabase Storage bucket
- **File details** — view name, size, MIME type, and upload timestamp for any file
- **Secure downloads** — files are served through short-lived signed URLs rather than public links
- **Ownership checks** — every folder/file route verifies the requesting user actually owns the resource before returning it
- **Styled UI** — Tailwind CSS v4 + DaisyUI v5 component library
- **Containerized** — fully dockerized app + database, runs identically on any machine with Docker installed

## Tech stack

| Layer | Tool |
|---|---|
| Server | Node.js, Express |
| Templating | EJS |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | Passport.js (`passport-local`), `express-session` |
| Session store | `@quixo3/prisma-session-store` |
| File uploads | Multer (in-memory storage) |
| Cloud storage | Supabase Storage (private bucket, signed URLs) |
| Password hashing | bcryptjs |
| Validation | express-validator |
| Styling | Tailwind CSS v4, DaisyUI v5 |
| Containerization | Docker, Docker Compose |

## Project structure

```
.
├── app.js                     # App entry point, middleware setup
├── app.css                    # Tailwind + DaisyUI source (compiled to public/output.css)
├── Dockerfile                 # Build instructions for the app container
├── docker-compose.yml         # Orchestrates the app + Postgres containers
├── .dockerignore
├── config/
│   ├── passport.js            # Passport LocalStrategy, serialize/deserialize
│   └── multer.js              # Multer memory storage config
├── lib/
│   └── supabase.js            # Shared Supabase client (service role)
├── database/
│   ├── prisma.js               # Shared PrismaClient instance
│   └── queries.js              # All Prisma queries
├── controllers/
│   ├── authenticationController.js
│   ├── indexController.js
│   ├── folderController.js
│   └── fileController.js
├── routes/
│   ├── authenticationRouter.js
│   ├── indexRouter.js
│   ├── folderRouter.js
│   └── fileRouter.js
├── middleware/
│   └── ensureAuthenticated.js
├── views/                      # EJS templates
├── public/
│   └── output.css              # Compiled Tailwind/DaisyUI CSS (generated, gitignored)
└── prisma/
    ├── schema.prisma
    └── migrations/
```

## Getting started

You can run this project either fully in Docker (recommended — no local Postgres or Node version management needed) or manually on your machine.

### Option A: Docker (recommended)

**Prerequisites:** Docker Desktop installed, a [Supabase](https://supabase.com) project with a **private** storage bucket.

**1. Clone and configure environment variables**

```bash
git clone <repo-url>
cd project-file-uploader
```

Create a `.env` file in the project root:

```env
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@db:5432/fileuploader?schema=public
SUPABASE_URL=https://<your-project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

> ⚠️ The Supabase **service role key** bypasses Row Level Security and must never be exposed to the client or committed to version control.

> Note: `DATABASE_URL` here points at `db` (the Postgres service name in `docker-compose.yml`), not `localhost` — this is how the app container reaches the database container over Docker's internal network.

**2. Build and start everything**

```bash
docker compose up --build
```

This builds the app image, pulls Postgres, and starts both containers.

**3. Run migrations (first time only, or after schema changes)**

In a second terminal:

```bash
docker compose exec app npx prisma migrate deploy
```

**4. Create your Supabase storage bucket**

In your Supabase dashboard, create a bucket named `user-files` and set it to **private**.

**5. Visit the app**

`http://localhost:3000`

**Everyday commands**

```bash
docker compose up              # start (no rebuild)
docker compose up --build      # start, rebuilding image (use after any code change)
docker compose down            # stop containers, keep data
docker compose down -v         # stop containers AND wipe database data — re-run migrations after this
```

### Option B: Manual (no Docker)

**Prerequisites:**
- Node.js (v22+ recommended)
- A PostgreSQL database (local or hosted)
- A [Supabase](https://supabase.com) project with a **private** storage bucket

**1. Clone and install**

```bash
git clone <repo-url>
cd project-file-uploader
npm install
```

**2. Configure environment variables**

Create a `.env` file in the project root:

```env
PORT=3000
DATABASE_URL=postgresql://user:password@host:port/dbname
SUPABASE_URL=https://<your-project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

**3. Set up the database**

```bash
npx prisma generate
npx prisma migrate dev
```

**4. Create your Supabase storage bucket**

Same as above — bucket named `user-files`, set to private.

**5. Build the CSS**

```bash
npm run css
```

(Runs the Tailwind CLI in watch mode, compiling `app.css` → `public/output.css`.)

**6. Run the app**

```bash
node --watch app.js
```

Visit `http://localhost:3000` (or whatever port you set in `PORT`).

## Styling

The UI is built with **Tailwind CSS v4** (utility-first CSS engine) and **DaisyUI v5** (a Tailwind plugin adding semantic component classes like `btn`, `card`, `navbar`, and `list` on top of Tailwind's utilities). This combination gives Bootstrap-like speed for common components while keeping full utility-class flexibility for layout and custom tweaks.

- `app.css` — source file, just the Tailwind + DaisyUI import directives
- `public/output.css` — compiled output actually linked in views (generated, not committed to Git)
- Theme is pinned via `data-theme="light"` on the `<html>` tag to keep styling consistent regardless of the user's OS dark-mode setting

## How uploads work

1. A logged-in user submits a file through the upload form (`multipart/form-data`).
2. Multer holds the file in memory (`req.file.buffer`) rather than writing to disk.
3. The server uploads the buffer to a private Supabase Storage bucket under a per-user path.
4. Only the returned storage path and file metadata (name, size, MIME type) are saved to Postgres via Prisma — the file bytes themselves live in Supabase, not the database.
5. When a user requests a download, the server verifies ownership, then asks Supabase for a **signed URL** (a temporary authenticated link) and redirects the browser there.

## Architecture note

Postgres runs locally (in its own Docker container via `docker-compose.yml`) while file storage is handled externally by Supabase Storage. Only uploaded file *bytes* live in Supabase — all relational data (users, folders, file metadata, sessions) lives in the containerized Postgres instance.

## Project checklist

- [x] Express + Prisma project setup
- [x] Session-based authentication with Passport.js
- [x] File upload form (Multer)
- [x] Folder CRUD
- [x] File details + secure download
- [x] Cloud storage integration (Supabase)
- [x] Styled UI (Tailwind CSS + DaisyUI)
- [x] Dockerized app + database
- [ ] File type/size validation

## License

MIT