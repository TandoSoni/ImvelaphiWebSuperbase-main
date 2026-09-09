# Imvelaphi Technologies - LMS

A learning-management webapp for Imvelaphi Technologies. Students work
through courses, lecturers upload content and track learner performance,
and admins manage the programme.

## Stack

- Backend: Node.js 18+ and Express
- Database: PostgreSQL via `pg` (tested with Supabase)
- Auth: JWT access and refresh tokens, with bcrypt password hashing
- Frontend: plain HTML, CSS and JavaScript; no build step required
- Uploads: Multer for videos and documents

## Database setup

1. Create a PostgreSQL database with Supabase, Neon, or another managed
   PostgreSQL provider. Copy its pooled connection URI into `DATABASE_URL`.
2. Copy `.env.example` to `.env` and fill in the real values. Set two
   different long random values for `ACCESS_TOKEN_SECRET` and
   `REFRESH_TOKEN_SECRET`.
3. Install dependencies and start the app:

   ```bash
   npm install
   npm start
   ```

On first startup the app connects to PostgreSQL, creates its tables, and
seeds the demo lecturer, admin, and three courses. No manual SQL is needed.

The `/health` endpoint returns `{"status":"ok"}` when the app and database
are available.

## Deployment

### Render and Supabase

Deploy this project as a **Render Web Service**, not a Static Site. The
repository-root `render.yaml` already configures Render to use
`imvelaphi-lms` as the service root. The Node server serves both the frontend
and `/api/*`, so the browser's relative API URLs work without a second
frontend service.

In Supabase, open **Project Settings -> Database -> Connection string -> URI**
and copy the **Transaction pooler** or **Session pooler** URL. Add it in
Render as the private `DATABASE_URL` environment variable. Do not put this
URL in frontend JavaScript.

Set these Render environment variables:

```text
NODE_ENV=production
DATABASE_URL=postgresql://...
ACCESS_TOKEN_SECRET=<generated-long-secret>
REFRESH_TOKEN_SECRET=<different-generated-long-secret>
CLIENT_ORIGIN=https://<your-render-service>.onrender.com
```

Use the service's own `onrender.com` URL for `CLIENT_ORIGIN` unless a custom
domain is configured. The app creates its PostgreSQL tables and seed data on
the first successful startup. Verify the connection at
`https://<your-render-service>.onrender.com/health`, which should return
`{"status":"ok"}`.

For other hosts, deploy the Node app with `npm start`, configure the variables
from `.env.example` as private host secrets, and set `CLIENT_ORIGIN` to the
deployed site origin. The app listens on the host's `PORT` value automatically.

For an IONOS subdomain, follow [IONOS_DEPLOYMENT.md](IONOS_DEPLOYMENT.md).

The host must provide a persistent volume mounted at `UPLOAD_DIR` for
lecturer uploads. On hosts with ephemeral disks, replace the local Multer
storage in `server/routes/lecturer.js` with Supabase Storage or S3 before
relying on uploaded videos and documents in production.

## Demo logins

| Role | Email | Password |
| --- | --- | --- |
| Lecturer | mlamuleli@imvelaphi.tech | demo1234 |
| Admin | admin@imvelaphi.tech | demo1234 |

Register a new account to try the student side. New students are assigned
all three courses automatically.

## Project structure

```text
server/
  index.js             Express entry point and static file hosting
  db/index.js          PostgreSQL connection, schema and seed data
  middleware/auth.js   JWT authentication and role checks
  routes/              Auth, courses, lecturer, admin, chat and orders APIs
public/                HTML, CSS, JavaScript and images
uploads/               Local video and document storage
.env.example           Environment variable template
```

Uploaded videos and documents are stored under `/uploads`. Use object
storage for production deployments whose local filesystem is ephemeral.
