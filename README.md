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

Deploy the Node app to Render, Railway, Fly.io, or a VPS with `npm start`.
Configure the variables in `.env.example` as host secrets and set
`CLIENT_ORIGIN` to the deployed site origin. The app listens on the host's
`PORT` value automatically.

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
