# Evolv Backend

FastAPI backend for the Evolv platform. The structure keeps application code, settings, API routes, database wiring, and tests separated so the project can grow without becoming tangled.

## Structure

```text
backend/
  app/
    api/              # API routers and request dependencies
    core/             # Settings and shared application config
    db/               # SQLAlchemy engine, sessions, and base model
    models/           # Database models
    repositories/     # Data-access helpers
    schemas/          # Pydantic request/response models
    services/         # Business logic
    main.py           # FastAPI application factory
  alembic/            # Database migrations
  tests/              # API and unit tests
```

## Local Setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
python -m pip install --upgrade pip
python -m pip install -e ".[dev]"
```

The local `.env` file is already ignored by git. Keep shared defaults in `.env.example`.

## Run The API

```bash
uvicorn app.main:app --reload
```

Health check:

```text
GET http://localhost:8000/api/v1/health
```

## Supabase Auth Signup

This backend uses Supabase Auth as the password owner. Passwords are sent to
Supabase Auth, where they are hashed and stored internally. The application
tables only store profile data.

Add these values to `.env` before testing signup:

```env
DATABASE_URL=postgresql+psycopg://postgres:YOUR_PASSWORD@YOUR_HOST:5432/postgres
SUPABASE_URL=https://rwhyjahpxivjchowalsc.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
SUPABASE_ANON_KEY=YOUR_ANON_OR_PUBLISHABLE_KEY
SUPABASE_AUTH_EMAIL_CONFIRM=true
```

`SUPABASE_ANON_KEY` is recommended for normal signin calls. If it is missing
during local backend testing, the backend falls back to the service role key.

If Supabase gives you a URL starting with `postgresql://`, you can paste it as-is.
The backend normalizes it to `postgresql+psycopg://` so SQLAlchemy uses the
installed `psycopg` driver.

Postman request:

```text
POST http://localhost:8000/api/v1/auth/signup
Content-Type: application/json
```

Founder body:

```json
{
  "role": "founder",
  "email": "founder@example.com",
  "password": "StrongPass123",
  "first_name": "Eman",
  "last_name": "Ali",
  "phone": "+923001234567",
  "country": "Pakistan",
  "country_code": "PK",
  "city": "Karachi",
  "terms_accepted": true,
  "founder_details": {
    "headline": "Building Evolv",
    "venture_stage": "idea",
    "primary_goal": "find_developers"
  }
}
```

Developer body:

```json
{
  "role": "developer",
  "email": "developer@example.com",
  "password": "StrongPass123",
  "first_name": "Ashhad",
  "last_name": "Khan",
  "country": "Pakistan",
  "country_code": "PK",
  "terms_accepted": true,
  "developer_details": {
    "job_title": "Full-stack Developer",
    "experience_years": 2,
    "github": "https://github.com/example",
    "portfolio_link": "https://example.com"
  }
}
```

Because Supabase Auth is the source of truth for passwords, `public.users`
should not have a `password_hash` column. Run
`supabase/drop_users_password_hash.sql` in the Supabase SQL Editor before
testing new signups against a schema that still has that column.

## Supabase Auth Signin

Postman request:

```text
POST http://localhost:8000/api/v1/auth/signin
Content-Type: application/json
```

Body:

```json
{
  "email": "founder@example.com",
  "password": "StrongPass123"
}
```

Signin only succeeds when:

- Supabase Auth accepts the email and password.
- The user also exists in `public.users`.
- The Supabase Auth user id matches `public.users.id`.

## Users

List users:

```text
GET http://localhost:8000/api/v1/users
Authorization: Bearer YOUR_ACCESS_TOKEN
```

Optional filters:

```text
GET http://localhost:8000/api/v1/users?role=founder&limit=20&offset=0
GET http://localhost:8000/api/v1/users?search=eman
```

Get one user:

```text
GET http://localhost:8000/api/v1/users/USER_UUID
Authorization: Bearer YOUR_ACCESS_TOKEN
```

The users list intentionally returns safe summary fields only. It does not
expose phone, DOB, gender, or full location details.

## Tests And Checks

```bash
pytest
ruff check .
```

## Database Migrations

```bash
alembic revision --autogenerate -m "describe change"
alembic upgrade head
```
