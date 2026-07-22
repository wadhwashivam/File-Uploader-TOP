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

## Project structure

```
.
├── app.js                     # App entry point, middleware setup
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
└── prisma/
    ├── schema.prisma
    └── migrations/
```

## Getting started

### Prerequisites

- Node.js (v22+ recommended)
- A PostgreSQL database (local or hosted)
- A [Supabase](https://supabase.com) project with a **private** storage bucket

### 1. Clone and install

```bash
git clone <repo-url>
cd project-file-uploader
npm install
```

### 2. Configure environment variables

Create a `.env` file in the project root:

```env
DATABASE_URL=postgresql://user:password@host:port/dbname
NODE_PORT=3000
SUPABASE_URL=https://<your-project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

> ⚠️ The Supabase **service role key** bypasses Row Level Security and must never be exposed to the client or committed to version control.

### 3. Set up the database

```bash
npx prisma generate
npx prisma migrate dev
```

### 4. Create your Supabase storage bucket

In your Supabase dashboard, create a bucket named `user-files` and set it to **private**.

### 5. Run the app

```bash
node --watch app.js
```

Visit `http://localhost:3000` (or whatever port you set in `NODE_PORT`).

## How uploads work

1. A logged-in user submits a file through the upload form (`multipart/form-data`).
2. Multer holds the file in memory (`req.file.buffer`) rather than writing to disk.
3. The server uploads the buffer to a private Supabase Storage bucket under a per-user path.
4. Only the returned storage path and file metadata (name, size, MIME type) are saved to Postgres via Prisma — the file bytes themselves live in Supabase, not the database.
5. When a user requests a download, the server verifies ownership, then asks Supabase for a **signed URL** (a temporary authenticated link) and redirects the browser there.

## Project checklist

- [x] Express + Prisma project setup
- [x] Session-based authentication with Passport.js
- [x] File upload form (Multer)
- [x] Folder CRUD
- [x] File details + secure download
- [x] Cloud storage integration (Supabase)
- [ ] File type/size validation

## License

MIT