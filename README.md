# MERN Starter Template (Slim)

A lightweight MERN boilerplate with:
- React + Vite frontend
- Express + MongoDB backend
- Shared monorepo scripts
- Your existing custom `useFetcher` implementation unchanged

## Project Structure

```text
react-starter-template/
├── .env.example
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/Fetcher/
│   │   ├── hooks/useFetcher.js
│   │   └── tests/
│   └── package.json
├── server/
│   ├── middleware/errorHandler.js
│   ├── tests/
│   ├── app.js
│   ├── server.js
│   └── package.json
└── package.json
```

## Getting Started

1. Install dependencies:
```bash
npm run install-all
```

2. Configure environment:
```bash
cp .env.example server/.env
```

3. Start both apps:
```bash
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

## API

### `GET /api/health`
Returns a basic health payload:

```json
{ "success": true, "message": "API is running" }
```

## Scripts

### Root
- `npm run install-all`
- `npm run dev`
- `npm run client`
- `npm run server`

### Client
- `npm run dev`
- `npm run lint`
- `npm run build`
- `npm test`

### Server
- `npm run dev`
- `npm start`
- `npm test`
