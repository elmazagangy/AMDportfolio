# Authentication System — Architecture & Workflow

## Overview

Full-stack auth system using **InsForge Backend** for user management,
email verification, OAuth, and session handling. Vanilla JS frontend
communicates with InsForge REST API via anonymous JWT.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5 + CSS3 + Vanilla JS |
| Backend | InsForge (auth, database, email) |
| Auth SDK | Fetch API → InsForge REST |
| Email | InsForge Platform (built-in, free) |
| Storage | Browser localStorage (session) |

## Auth Config (InsForge Backend)

| Setting | Value |
|---------|-------|
| `requireEmailVerification` | `true` |
| `verifyEmailMethod` | `code` (6-digit OTP) |
| `resetPasswordMethod` | `code` (6-digit OTP) |
| `passwordMinLength` | `6` |
| `requireNumber` | `true` |
| `requireLowercase` | `true` |
| `requireUppercase` | `true` |
| `requireSpecialChar` | `true` |
| `oAuthProviders` | `google`, `github` |
| `smtpConfig.enabled` | `false` (uses InsForge built-in) |
| `disableSignup` | `false` |

## User Flow

```
                    ┌──────────────────────────────────┐
                    │         Welcome Screen            │
                    │    [Sign In] [Create Account]     │
                    └──────────┬───────────────────────┘
                               │
                ┌──────────────┴──────────────┐
                │                             │
        ┌───────▼───────┐           ┌─────────▼─────────┐
        │   Sign In     │           │   Sign Up         │
        │ email+pass    │           │ email+pass+name   │
        └───────┬───────┘           └─────────┬─────────┘
                │                             │
                │              ┌──────────────▼──────────────┐
                │              │  Email Verification (OTP)   │
                │              │  [6-digit code input]       │
                │              │  [Resend Code] [Verify]     │
                │              └──────────────┬──────────────┘
                │                             │
                └──────────┬──────────────────┘
                           │
                ┌──────────▼──────────┐
                │   Dashboard         │
                │ [Profile] [Logout]  │
                └─────────────────────┘
```

## Password Reset Flow

```
  ┌────────────────────┐
  │  Forgot Password?  │
  │  Enter Email       │
  └─────────┬──────────┘
            │
  ┌─────────▼──────────┐
  │  OTP Verification  │
  │  [6-digit code]    │
  └─────────┬──────────┘
            │
  ┌─────────▼──────────┐
  │  New Password      │
  │  [password] [conf] │
  └─────────┬──────────┘
            │
  ┌─────────▼──────────┐
  │  Success → Sign In │
  └────────────────────┘
```

## OAuth Flow (PKCE)

```
  [Sign In with Google] / [Sign In with GitHub]
              │
  Generate code_verifier + SHA-256 → code_challenge
              │
              ▼
  GET /api/auth/oauth/{provider}?redirect_uri=...&code_challenge=...
              │
              ▼
  User authenticates with provider
              │
              ▼
  Browser redirects to redirect_uri?insforge_code=...
              │
              ▼
  POST /api/auth/oauth/exchange { code, code_verifier }
              │
              ▼
         Dashboard
```

## API Endpoints Used

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/auth/users` | Register new user |
| POST | `/api/auth/email/verify` | Verify email with OTP code |
| POST | `/api/auth/email/send-verification` | Resend verification code |
| POST | `/api/auth/sessions` | Sign in with email+password |
| POST | `/api/auth/logout` | Sign out |
| GET | `/api/auth/sessions/current` | Get current user |
| POST | `/api/auth/email/send-reset-password` | Send reset code |
| POST | `/api/auth/email/exchange-reset-password-token` | Exchange code for token |
| POST | `/api/auth/email/reset-password` | Set new password |
| GET | `/api/auth/oauth/{provider}` | Initiate OAuth flow (PKCE) |
| POST | `/api/auth/oauth/exchange` | Exchange OAuth code for tokens |

## File Structure

```
portfolio/
├── project-6.html       ← Auth system page (standalone demo)
├── styles/main.css       ← Shared styles
├── scripts/main.js       ← Shared JS (auth helpers for index)
└── PLAN.md               ← This document
```

## Security

- Anonymous JWT for public endpoints (sign-up, sign-in)
- Session token stored in httpOnly cookie by InsForge
- Access token in memory (not localStorage)
- CSRF token for state-changing requests
- All passwords validated client-side + server-side
- OAuth uses PKCE flow

## Blog

4 bilingual articles on `blog.html`:
| # | Arabic Title | English Title |
|---|-------------|--------------|
| 1 | #الهوية_الرقمية او الإلكترونية او #العلامة_التجارية اون لاين او #براند / #براندينج ؟؟؟ | Digital Identity vs. Branding: What's the Difference? |
| 2 | الدليل الكامل لتحويل المحتوى إلى ماكينة مبيعات: تصميم موقع احترافي وإدارة سوشيال ميديا بذكاء | The Complete Guide to Turning Content into a Sales Machine |
| 3 | كيف تجلب المزيد من العملاء المحتملين عبر المحتوى الاحترافي وتصميم المواقع وإدارة السوشيال ميديا في 2026 | How to Generate More Qualified Leads Through Content, Design & Social Media in 2026 |
| 4 | نظام التوثيق الآمن: بناء مدخل آمن لموقعك باستخدام InsForge | Secure Authentication System: Build a Safe Entry Point for Your Website with InsForge |

## Implementation Checklist

- [x] Sign Up form with name, email, password
- [x] Password strength validation (number, upper, lower, special)
- [x] Email verification via 6-digit OTP
- [x] Resend verification code
- [x] Sign In with email + password
- [x] Forgot Password flow (email → OTP → new password)
- [x] OAuth with Google (PKCE flow)
- [x] OAuth with GitHub (PKCE flow)
- [x] Session check on page load
- [x] Sign Out with session clear
- [x] Dashboard view (logged-in state)
- [x] Error handling for all API calls
- [x] Bilingual (AR/EN) support
- [x] RTL/LTR direction switching
- [x] Dark/Light theme support
- [x] Mobile responsive
- [x] Loading states + disabled buttons during API calls
