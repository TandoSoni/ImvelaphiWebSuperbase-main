require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const { initDb, run } = require('./db');
const authRoutes = require('./routes/auth');
const { router: courseRoutes } = require('./routes/courses');
const lecturerRoutes = require('./routes/lecturer');
const adminRoutes = require('./routes/admin');
const chatRoutes = require('./routes/chat');
const orderRoutes = require('./routes/orders');

const uploadDir = path.resolve(__dirname, '..', process.env.UPLOAD_DIR || 'uploads');

// Ensure upload folders exist (this is the reserved "space for video")
['videos', 'docs'].forEach(dir => {
  const full = path.join(uploadDir, dir);
  if (!fs.existsSync(full)) fs.mkdirSync(full, { recursive: true });
});

async function main() {
  if (process.env.NODE_ENV === 'production') {
    const required = ['DATABASE_URL', 'ACCESS_TOKEN_SECRET', 'REFRESH_TOKEN_SECRET'];
    const missing = required.filter(name => !process.env[name] || process.env[name].startsWith('change-me'));
    if (missing.length) throw new Error(`Missing production environment variables: ${missing.join(', ')}`);
  }

  await initDb();

  const app = express();
  app.set('trust proxy', 1);

  const allowedOrigins = (process.env.CLIENT_ORIGIN || '').split(',').map(origin => origin.trim()).filter(Boolean);
  app.use(cors({ origin: allowedOrigins.length ? allowedOrigins : true }));
  app.use(express.json());

  app.get('/health', async (req, res) => {
    try {
      await run('SELECT 1');
      res.json({ status: 'ok' });
    } catch {
      res.status(503).json({ status: 'error' });
    }
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/courses', courseRoutes);
  app.use('/api/lecturer', lecturerRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/chat', chatRoutes);
  app.use('/api/orders', orderRoutes);

  app.use('/uploads', express.static(uploadDir));

  app.use(express.static(path.join(__dirname, '..', 'public')));
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
  });

  const PORT = Number(process.env.PORT) || 3000;
  const HOST = process.env.HOST || '0.0.0.0';
  app.listen(PORT, HOST, () => console.log(`Imvelaphi LMS listening on ${HOST}:${PORT}`));
}

main().catch(err => {
  console.error('Failed to start server. code=%s message=%s', err && err.code, err && err.message);
  console.error(err && err.stack);
  process.exit(1);
});
