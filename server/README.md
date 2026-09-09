# LeadFlow CRM API

The active backend is an Express + TypeScript API backed by MongoDB and Mongoose.

## Setup

Create `server/.env` from `.env.example`:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/leadflow
JWT_SECRET=replace-with-a-long-random-secret
CLIENT_URL=http://localhost:3002
NODE_ENV=development
AI_API_KEY=
AI_PROVIDER=
```

Install, seed, and run:

```bash
npm install
npm run seed:mongo
npm run dev
```

The API is available at `http://localhost:5000`.

## Security boundaries

Protected routes require an httpOnly JWT cookie, a valid organization claim, and the required RBAC permission. Lead and task queries always include the authenticated organization ID.

## Endpoints

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/leads`
- `POST /api/leads`
- `GET /api/leads/:id/score`
- `GET /api/leads/:id/insights`
- `GET /api/tasks?view=overdue|today|tomorrow|upcoming`
- `POST /api/tasks`
- `PATCH /api/tasks/:id`
- `DELETE /api/tasks/:id`

## Build

```bash
npm run build
npm start
```
