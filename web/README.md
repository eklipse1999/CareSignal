# CareSignal Clinician Dashboard

React/Vite clinician dashboard for the biomedical risk system. It uses the Node/Express backend for authentication, patient records, and prediction history.

## Setup

```bash
cd web
npm install
copy .env.example .env
npm run dev
```

Open the Vite URL shown in the terminal, normally `http://localhost:5173`.

The backend must be running on port 8000:

```bash
cd backend
npm start
```

The frontend defaults to `http://127.0.0.1:8000`. To override it, set this in `web/.env`:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

Log in with a clinician or admin account. Patient accounts are deliberately blocked from the dashboard.
