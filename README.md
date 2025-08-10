# Test_School Competency Assessment Platform (Backend)

## Live Deployment Link: https://digital-assessment-backend.vercel.app
Robust Node.js + TypeScript backend implementing:
- Multi-step (3) assessment engine (A1 → C2)
- JWT auth with refresh rotation
- Redis-based OTP (email verification + password reset)
- Role-based authorization (admin, supervisor, student)
- Question management with pagination
- Assessment attempt tracking, scoring & progression logic
- Certificate PDF generation (pdf-lib) + email delivery (Nodemailer)
- Analytics endpoints (users, competency performance, assessments)
- Real-time proctoring Socket.IO channel for heartbeat & suspicious activity
- Secure architecture, layered services, Zod validation, centralized error handling

## Tech Stack
Node.js, Express, TypeScript, Mongoose, Redis (ioredis), JWT, Zod, pdf-lib, Nodemailer, Socket.IO, Pino.

## Quick Start
```bash
cp .env.example .env
pnpm install # or npm / yarn
pnpm dev
```

Ensure MongoDB & Redis instances are running.

## API Summary
See provided specification. Core route prefixes:
- /api/auth/*
- /api/assessment/*
- /api/admin/questions*
- /api/analytics/*
- /api/assessment/certificate

## Assessment Logic
Step/Score → Outcome implemented in `utils/assessmentRules.ts`.

## Real-Time Proctoring
Socket namespace authenticated via access token:
```
const socket = io(BASE, { auth: { token: accessToken } });
socket.emit('heartbeat', { attemptId, fullscreen, visible, ts: Date.now() });
```

## Security Notes
- Refresh token rotation invalidates stale tokens using tokenVersion.
- Add Redis blacklist if you need forced logout before rotation.
- Rate limiting applied to auth endpoints.
- Helmet + CORS configured via env.

## TODOs / Enhancements
- Implement certificate caching & download streaming.
- Add CSV/PDF analytics export.
- Add supervisor endpoints (invalidate session, monitor).
- Add SEB integration signals from frontend.
- Add video stream (WebRTC forwarding).
- Add AI proctoring pipeline (future).
- Add unit/integration tests (Vitest) for services.
- Implement refresh token blacklist / reuse detection.

## License
Internal / Proprietary (adjust as needed).
