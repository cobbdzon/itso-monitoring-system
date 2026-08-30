# CLA Monitoring System

Web app for tracking Computer Lab Assistant (CLA) time-in/time-out attendance. Members register and log hours; admins get a dashboard of member status, can time in/out on their behalf, and manage accounts. Built with Node.js, Express, EJS, Sequelize, and PostgreSQL. Postgres runs in a container; the app runs directly on the host.

## Prerequisites

- Node.js
- PostgreSQL container runtime: [podman](https://podman.io) + `podman-docker` (preferred) or docker
- `podman compose` support (podman 4.2+)

Some podman installs can't pull from `docker.io` by default. Add it to the registry search list in `/etc/containers/registries.conf`:

```
[registries.search]
registries = ['docker.io']
```

Optional: [lazydocker](https://github.com/jesseduffield/lazydocker) TUI for container management. If using it with podman, point `DOCKER_HOST` at podman's socket (e.g. `unix:///run/user/$UID/podman/podman.sock`).

## Setup

### 1. Configure environment

Copy the example env file and fill in values:

```bash
cp .env-example .env
```

`.env` is git-ignored, so never commit it. Set real secrets for `SESSION_SECRET`, `DATABASE_PASSWORD`, and `DEFAULT_ADMIN_PASSWORD`. The `POSTGRES_*` vars configure the database container; the `DATABASE_*` vars configure the app's connection to it.

### 2. Start the database

Create the data directory, then start the Postgres container (podman or docker):

```bash
mkdir -p .postgres/data
podman compose up -d        # or: docker compose up -d
```

Data persists to `./.postgres/data` (git-ignored).

### 3. Install dependencies

```bash
npm install
```

## Development

```bash
npm run dev
```

Watches SCSS (compiles `public/scss` → `public/css`) and auto-restarts the server with nodemon. There are no migrations — the schema is dropped and recreated on every startup, and a default `admin` user is seeded with `DEFAULT_ADMIN_PASSWORD`.

Open `http://localhost:3000` (or `$PORT`).

## Production

Compile assets and start the server:

```bash
npm start
```

For a persistent service, run it under systemd or a process manager (e.g. pm2) and set `NODE_ENV=production` in the environment (this disables dotenv loading of `.env`).

## Scripts

| Script | Purpose |
| --- | --- |
| `npm start` | Build SCSS and start the server |
| `npm run dev` | Watch SCSS and restart on changes |
| `npm run scss:build` / `scss:watch` | Compile SCSS once / watch mode |
| `npm run server:start` / `server:watch` | Start server / with nodemon |
