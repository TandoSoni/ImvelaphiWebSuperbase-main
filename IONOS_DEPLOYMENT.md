# IONOS subdomain deployment

## Important hosting requirement

This project is an Express/Node.js application. It cannot run on an IONOS
shared hosting package that only supports PHP and static files. Use an IONOS
Node.js-capable plan, Cloud Server, or VPS. The Node process must be allowed
to run continuously and must support `npm install` and `npm start`.

## 1. Create the subdomain

In IONOS:

1. Open **Domains & SSL** and create the desired subdomain, for example
   `learn.example.com`.
2. Point the subdomain to the Node.js application or reverse proxy supplied
   by the IONOS hosting product.
3. Enable SSL for the subdomain and force HTTPS.

The public URL will be:

```text
https://learn.example.com
```

## 2. Create the database

Create a project in Supabase or another managed PostgreSQL provider. Use its
**Session pooler** or **Transaction pooler** URI, not a local database URI.
The application creates its tables and seed data during its first startup.

## 3. Upload the application

Upload the contents of `imvelaphi-lms` to the application directory. Keep
`server/`, `public/`, `package.json`, and `package-lock.json` together.
Do not upload a real `.env` file to a public web directory.

Run from the project directory:

```bash
npm ci --omit=dev
npm start
```

Set the IONOS Node application entry point/start command to:

```text
npm start
```

## 4. Configure environment variables

Set these in the IONOS application settings or private environment file:

```text
NODE_ENV=production
CLIENT_ORIGIN=https://learn.example.com
DATABASE_URL=postgresql://...
ACCESS_TOKEN_SECRET=<long-random-secret>
REFRESH_TOKEN_SECRET=<different-long-random-secret>
ACCESS_TOKEN_TTL=30m
REFRESH_TOKEN_TTL=7d
UPLOAD_DIR=/persistent/imvelaphi/uploads
MAX_UPLOAD_BYTES=524288000
ANTHROPIC_API_KEY=
CHAT_MODEL=claude-sonnet-4-6
```

Do not use the placeholder values from `.env.example`. Generate secrets with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Use a second generated value for `REFRESH_TOKEN_SECRET`.

If the IONOS product does not provide a persistent volume, keep
`UPLOAD_DIR=uploads` only for testing. Uploaded videos and documents will be
lost when the application is redeployed or the server is reset. For
production, use an IONOS persistent volume or move Multer storage to Supabase
Storage/S3.

## 5. Verify the deployment

Open these URLs after the process starts:

```text
https://learn.example.com/health
https://learn.example.com/
```

The health endpoint should return:

```json
{"status":"ok"}
```

Then test registration, login, course loading, and one order request. Check
IONOS logs if the app does not start. The most common causes are a missing
`DATABASE_URL`, incorrect pooler credentials, an unavailable Node runtime, or
an upload directory without write permission.
