# Placement Prep Portal

A student dashboard to track placement applications, view preparation resources, and record eligibility metrics.

**Stack:** React (Vite), Express, SQLite, JWT

## Run locally

Prerequisites: Node.js 20 or later and npm.

```powershell
git clone https://github.com/sohinitandons115-star/SA3-placement-prep-portal.git
cd SA3-placement-prep-portal
cd server
npm install
npm run dev
```

In another terminal:

```powershell
cd path\to\SA3-placement-prep-portal\client
npm install
npm run dev
```

Open the Vite URL shown in the terminal (usually `http://localhost:5173`). The backend runs at `http://localhost:5000`; its health check is `/api/health`.

The backend creates `server/data/placement.sqlite` automatically. Set `DB_PATH` to use another file path. The database file is ignored by Git and stays on the computer or server that stores it.

Optional local environment:

**`server/.env`**
```env
PORT=5000
JWT_SECRET=replace_with_a_long_random_secret
DB_PATH=./data/placement.sqlite
CLIENT_ORIGIN=http://localhost:5173
```

**`client/.env`**
```env
VITE_API_URL=http://localhost:5000/api
```

`VITE_API_URL` must include `/api`. The client defaults to the local API URL when the variable is not set.

## Deploy

Deploy the React client on Vercel and the Express API on Render. Do not host the SQLite database file on Vercel: serverless function filesystems are temporary and can lose database writes.

### 1. Push the project to GitHub

Commit and push your changes to the GitHub repository/branch you want to deploy. In GitHub, confirm the latest commit is visible before connecting the hosts.

### 2. Deploy the API on Render

1. Create a **Web Service** in the Render dashboard and connect the GitHub repository.
2. Set **Root Directory** to `server`.
3. Set **Build Command** to `npm install`.
4. Set **Start Command** to `npm start`.
5. Add a persistent disk mounted at `/var/data`. A durable SQLite database requires persistent storage; confirm the disk and service pricing in Render before creating it.
6. Add these environment variables in the Render service settings:
   - `DB_PATH` = `/var/data/placement.sqlite`
   - `JWT_SECRET` = a long random secret
   - `CLIENT_ORIGIN` = your Vercel site URL (for example, `https://your-project.vercel.app`)
   - `NODE_VERSION` = `22`
7. Deploy and verify `https://<your-render-service>.onrender.com/api/health` returns `{"status":"ok"}`.

### 3. Deploy the client on Vercel

1. Import the same GitHub repository into Vercel.
2. Set **Root Directory** to `client`.
3. Select **Vite** as the framework preset. Use build command `npm run build` and output directory `dist`.
4. Add the environment variable `VITE_API_URL` = `https://<your-render-service>.onrender.com/api`.
5. Deploy. Copy the final Vercel site URL into Render's `CLIENT_ORIGIN` setting and redeploy the API.

After deploying, register a test account and create an application to verify end-to-end writes. The SQLite file lives on the Render disk, not in GitHub or VS Code. Back up that persistent file regularly.

### GitHub and deployment updates

For future changes, commit and push to the connected GitHub branch. Vercel and Render can automatically redeploy when that branch receives a push. Keep `.env` files, JWT secrets, and SQLite database files out of GitHub.

SQLite starts as a new, empty database: existing MongoDB data is not migrated automatically. Export and migrate any MongoDB records you want to keep before switching production users to this version.

## API

| Method | Endpoint | Authentication | Description |
|---|---|---|---|
| GET | `/api/health` | No | API health check |
| POST | `/api/auth/register` | No | Register |
| POST | `/api/auth/login` | No | Login |
| GET | `/api/companies` | Yes | List the signed-in user's applications |
| POST | `/api/companies` | Yes | Create an application |
| PUT | `/api/companies/:id` | Yes | Update an application |
| DELETE | `/api/companies/:id` | Yes | Delete an application |
| GET | `/api/resources` | Yes | List resources |
| POST | `/api/resources` | Yes | Add a resource |
| DELETE | `/api/resources/:id` | Yes | Delete a resource |
| GET/PUT | `/api/users/profile` | Yes | Read/update profile metrics |

See [PRD.md](./PRD.md) for product requirements and [TRD.md](./TRD.md) for the technical design.
