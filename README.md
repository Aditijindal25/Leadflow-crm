# LeadFlow CRM

LeadFlow is a multi-tenant, MongoDB-backed lead management foundation for agencies, consultants, and small teams.

## Active stack

- Frontend: React, Vite, React Router, Axios, Tailwind CSS
- Backend: Node.js, Express, TypeScript, Mongoose
- Authentication: JWT in an httpOnly cookie, bcrypt password hashing
- Security: Helmet, CORS allowlist, API/login rate limits, Zod validation
- Database: MongoDB or MongoDB Atlas

## Current capabilities

- Public lead capture with duplicate detection
- Create-account and sign-in flows
- Organization/workspace foundation
- Owner, admin, manager, sales agent, and viewer roles
- Organization-scoped lead queries and mutations
- Search, filters, pagination, and lead stats
- Explainable lead scoring with hot/warm/cold temperature
- Lead intelligence and next-best-action endpoints
- Responsive Vite dashboard
- Health monitoring with MongoDB connection status

## Run locally

Start MongoDB, then configure `server/.env`:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/leadflow
JWT_SECRET=replace-with-a-long-random-secret
CLIENT_URL=http://localhost:3002
PORT=5000
NODE_ENV=development
DEFAULT_ORGANIZATION_ID=
```

Start the API:

```bash
cd server
npm install
npm run seed:mongo
npm run dev
```

Copy the workspace ID printed by the seed command into `DEFAULT_ORGANIZATION_ID`, then restart the API.

Start the Vite client in a second terminal:

```bash
cd client
npm install
npm run dev
```

Open `http://localhost:3002`.

## Build checks

```bash
cd client && npm run build
cd ../server && npm run build
```

## Architecture

The active path is:

```text
React/Vite -> Axios API -> Express middleware -> controllers -> services/models -> MongoDB
```

The repository also contains earlier Next.js/Prisma work retained for history. The active application is the `client/` Vite app and the MongoDB-backed `server/` API.
