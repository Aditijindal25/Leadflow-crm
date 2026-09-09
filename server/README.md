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
```

Then run:

```bash
npm install
npm run seed:mongo
npm run dev
```

The API is available at `http://localhost:5000`.

## Important endpoints

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/leads`
- `POST /api/leads`
- `GET /api/leads/:id/score`
- `GET /api/leads/:id/insights`

All authenticated lead reads and mutations are organization-scoped.
