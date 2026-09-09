# LeadFlow CRM Client

The active frontend is a React + Vite CRM workspace running on `http://localhost:3002` during development.

## Setup

```bash
npm install
npm run dev
```

## Environment

Create `.env` from `.env.example`:

```env
VITE_API_URL=http://localhost:5000/api
```

## Build

```bash
npm run build
npm run preview
```

## Main routes

- `/` public landing page
- `/contact` lead capture
- `/login` sign in and workspace registration
- `/dashboard` protected CRM dashboard
- `/tasks` protected task and follow-up queue
