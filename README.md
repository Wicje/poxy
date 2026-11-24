# Neighbourhood Market Hub Backend

Initial local backend workspace for the marketplace API foundation.

## Stack

- Node.js 20+ and npm
- Express for the HTTP API
- PostgreSQL 16 as the relational database
- Docker Compose for a repeatable local database, or an existing local PostgreSQL server

## Local setup

1. Install dependencies:

   ```sh
   npm install
   ```

2. Create your local settings file and fill in values for your machine:

   ```sh
   cp .env.example .env
   ```

   `.env` is ignored by Git. Never commit database passwords or other secrets. The example file contains variable names only.

3. Start the local database:

   ```sh
   docker compose up -d db
   ```

   If you use an existing PostgreSQL server instead, set `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, and `DB_PASSWORD` in `.env` to match it.

4. Check the database connection and start the API:

   ```sh
   npm run db:check
   npm run dev
   ```

## Verify the setup

With the server running, request the health endpoint:

```sh
curl http://localhost:3000/health
```

Expected response:

```json
{ "status": "ok", "service": "neighbourhood-market-hub" }
```

`GET /health/db` reports the database connection state and uses the same local settings.

## Notes

- `npm start` runs the API without file watching; `npm run dev` restarts on file changes.
- No domain tables or business routes are created yet. The Sprint 1 design docs in `docs/` describe what comes next.
- Stop the local database with `docker compose down` when finished.
