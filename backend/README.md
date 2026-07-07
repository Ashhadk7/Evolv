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
FIREBASE_CREDENTIALS_JSON=YOUR_FIREBASE_SERVICE_ACCOUNT_JSON_AS_ONE_LINE
SIGNUP_OTP_EXPIRE_MINUTES=5
SIGNUP_OTP_RETURN_DEBUG=false

EMAIL_FROM_EMAIL=evolvv.aii@gmail.com
EMAIL_FROM_NAME="Evolv AI"
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USERNAME=evolvv.aii@gmail.com
SMTP_PASSWORD=YOUR_GOOGLE_APP_PASSWORD
SMTP_USE_SSL=true
SMTP_USE_STARTTLS=false
SMTP_TIMEOUT_SECONDS=20
```

`SUPABASE_ANON_KEY` is recommended for normal signin calls. If it is missing
during local backend testing, the backend falls back to the service role key.

If Supabase gives you a URL starting with `postgresql://`, you can paste it as-is.
The backend normalizes it to `postgresql+psycopg://` so SQLAlchemy uses the
installed `psycopg` driver.

Run migrations before testing signup:

```bash
alembic upgrade head
```

In Supabase, make sure Email Auth is enabled. Do not add Firebase, Clerk, Auth0,
or any other Third-Party Auth provider for this email OTP flow.

The backend generates its own 6-digit verification code, stores only a hash in
`pending_signups`, and sends the code by SMTP. For Gmail testing, `SMTP_PASSWORD`
must be a Google App Password, not the normal Gmail password. If Google shows the
app password with spaces, paste it without spaces.

Keep `SIGNUP_OTP_RETURN_DEBUG=false` for real email testing. Set it to `true`
only when you intentionally want the OTP returned in the Postman response during
local debugging.

Start signup:

```text
POST http://localhost:8000/api/v1/auth/signup/start
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

Response:

```json
{
  "email": "founder@example.com",
  "expires_at": "2026-07-07T12:05:00Z",
  "message": "Verification code sent. Complete signup by verifying your email."
}
```

Verify the email OTP:

```text
POST http://localhost:8000/api/v1/auth/signup/verify-email
Content-Type: application/json
```

Body:

```json
{
  "email": "founder@example.com",
  "otp": "123456"
}
```

Resend OTP:

```text
POST http://localhost:8000/api/v1/auth/signup/resend-otp
Content-Type: application/json
```

Body:

```json
{
  "email": "founder@example.com"
}
```

Supabase Auth stores the password. The backend verifies the signup OTP, marks
the Supabase Auth email as confirmed, and only then creates `public.users` plus
the role-specific profile.

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

## Phone Verification

Phone verification is optional after signin. It does not block signup or signin.
The settings page should use Firebase client-side phone auth to send the SMS OTP,
then send the Firebase ID token to this backend after the user enters the correct
SMS code.

Firebase client flow:

1. User opens settings and clicks verify phone.
2. Frontend calls Firebase `signInWithPhoneNumber(...)` with the phone number.
3. Firebase sends the SMS OTP.
4. User enters the OTP in the frontend.
5. Frontend calls `confirmationResult.confirm(code)`.
6. Frontend calls `result.user.getIdToken()` and sends that token to the backend.

Backend status:

```text
GET http://localhost:8000/api/v1/phone/status
Authorization: Bearer YOUR_SUPABASE_ACCESS_TOKEN
```

Backend verify:

```text
POST http://localhost:8000/api/v1/phone/verify
Authorization: Bearer YOUR_SUPABASE_ACCESS_TOKEN
Content-Type: application/json
```

Body:

```json
{
  "firebase_id_token": "FIREBASE_ID_TOKEN_FROM_FRONTEND"
}
```

Response:

```json
{
  "phone": "+923001234567",
  "phone_verified": true,
  "message": "Phone number verified successfully."
}
```

The backend verifies the Firebase ID token with Firebase Admin SDK, reads the
verified `phone_number` claim, and updates `public.users.phone` plus
`public.users.phone_verified`.

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
