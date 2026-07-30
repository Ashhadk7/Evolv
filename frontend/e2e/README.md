# Evolv Playwright Automation

These scripts automate the stable parts of the manual QA file with Playwright.
Provider-heavy flows such as real email OTP, Twilio, Google Meet, AI generation,
and live messaging are intentionally mocked or left for integration testing.

## Run

```bash
cd frontend
npm run test:e2e
```

If Next dev server shutdown hangs after the tests print `ok`, start the e2e
frontend yourself in one terminal and point Playwright at it from a second
terminal:

```powershell
npm run dev:e2e
```

```powershell
npm run test:e2e:local
```

Useful variants:

```bash
npm run test:e2e:headed
npm run test:e2e:ui
npm run test:e2e:report
```

API smoke tests are opt-in so the normal UI suite does not fail when the backend
is not running:

```powershell
cd ..\backend
.\.venv\Scripts\activate
uvicorn app.main:app --reload
```

In a second terminal:

```powershell
cd ..\frontend
npm run test:e2e:api
```

On Windows this config uses installed Microsoft Edge by default. If you want to
use Playwright's bundled Chromium instead, install it once:

```bash
npx playwright install chromium
```

Then run with:

```powershell
$env:PLAYWRIGHT_BROWSER_CHANNEL="bundled"
npm run test:e2e
```

## Current Coverage Map

- `TC-PUB-001` to `TC-PUB-004`, `TC-PUB-006`
- `TC-AUTH-001` to `TC-AUTH-006`, `TC-AUTH-009` to `TC-AUTH-020`, `TC-AUTH-022` to `TC-AUTH-024`, `TC-AUTH-031`, `TC-AUTH-035` to `TC-AUTH-037`
- `TC-FDASH-001`, `TC-FDASH-005`
- `TC-WORK-001`, `TC-WORK-005`, `TC-WORK-006`, `TC-WORK-007`
- `TC-DSET-001` smoke coverage through the developer shell
- `TC-API-001`, `TC-API-007` when `E2E_API_BASE_URL` is set
