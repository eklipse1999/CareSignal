# Stage 2 - Node.js API

This service provides JWT authentication, role-based access control, patient records, prediction history, and the gateway from the application to the Stage 1 FastAPI ML service.

## Requirements

- Node.js 18+
- MySQL 8+
- The Stage 1 service running on port 8001

## Setup

```bash
cd backend
npm install
copy .env.example .env
```

Edit `.env` with the MySQL credentials and a long private `JWT_SECRET`. `ML_SERVICE_URL` should normally remain `http://127.0.0.1:8001`.
Set `ENCRYPTION_KEY` to a fresh 64-character hexadecimal value generated with
`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.

## Database

Run the schema once against MySQL:

```bash
mysql -u root -p < schema.sql
```

For an existing database, apply the account-status migration once:

```bash
mysql -u root -p biomed_risk < migrations/002_add_is_active_to_users.sql
```

Then apply the security migration. It changes sensitive columns to encrypted
text storage and allows failed logins for unknown emails to be audited:

```bash
mysql -u root -p biomed_risk < migrations/003_security_hardening.sql
```

Before using the encrypted application with existing development data, reset
the old plaintext values. The development migration used for this workspace
already performed this reset:

```sql
DELETE FROM predictions;
UPDATE patients SET date_of_birth = NULL, phone = NULL;
```

The schema creates the `biomed_risk` database and the `users`, `patients`, `predictions`, and `audit_logs` tables. Registration creates a patient profile automatically when the new user's role is `patient`.

## Run

Start Stage 1 first:

```bash
cd ml-service
uvicorn app:app --reload --port 8001
```

Then start Stage 2 in another terminal:

```bash
cd backend
npm start
```

The API listens on `http://127.0.0.1:8000`. Send JWTs as `Authorization: Bearer <token>`.

## API summary

- `POST /api/auth/register` and `POST /api/auth/login`
- `GET /api/patients/me` for patients
- `GET /api/patients/:id` for the patient, clinician, or admin permitted by role/ownership
- `PATCH /api/patients/:id` for the patient owner or admin
- `POST /api/predictions/diabetes` and `POST /api/predictions/heart`
- `GET /api/predictions/:patientId` for clinicians and admins
- `GET /api/admin/clinicians` for admins
- `PATCH /api/admin/clinicians/:id/deactivate` for admins
- `PATCH /api/admin/clinicians/:id/reactivate` for admins

Prediction requests use `{ "patientId": 1, "inputData": { ... } }`. Patient users cannot choose another `patientId`; clinicians and admins must provide one.

## Security

- Helmet adds standard security response headers. Content Security Policy is
	disabled because this API serves a separate local Vite frontend; browser
	access is still limited by the explicit CORS allowlist.
- CORS allows only `http://localhost:5173` and `http://127.0.0.1:5173`, never `*`.
- Authentication endpoints are limited to 5 requests per IP per 15 minutes.
	Other `/api/*` routes are limited to 100 requests per IP per 15 minutes.
- JWTs contain only `id` and `role` and expire after 2 hours. Expired tokens
	return `401 Session expired, please log in again`.
- Passwords use bcrypt with 12 salt rounds. Registration and clinician creation
	require at least 8 characters and reject passwords containing the person's
	name or email username.
- User-entered names, patient profile text, and stored text fields are escaped
	with `validator` before storage. All SQL uses mysql2 prepared statements with
	`?` parameters; no request value is concatenated into SQL.
- `input_data`, date of birth, and phone are encrypted at rest with AES-256-GCM.
	The key is `ENCRYPTION_KEY`, a 64-character hexadecimal value representing
	32 random bytes. Never commit the real key.
- Failed login attempts write `FAILED_LOGIN` audit rows. Unknown email attempts
	use a `NULL` audit `user_id`; known-user failures retain the user ID.
- API responses never include `password` or `password_hash`.