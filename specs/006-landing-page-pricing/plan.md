# Implementation Plan: Landing Page with Pricing and Rate Limit UI

**Branch**: `006-landing-page-pricing` | **Date**: 2026-04-29 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/006-landing-page-pricing/spec.md`

## Summary

Create a landing page for Decidely.ai showcasing the product's value proposition, pricing tiers, and navigation to the decision-making interface. Also implement rate limit UI feedback and voucher code redemption interface.

## Technical Context

**Language/Version**: Python 3.11+ (backend), JavaScript/React (frontend)
**Primary Dependencies**: React, react-router-dom (for routing), Tailwind CSS
**Storage**: N/A (no new data persistence)
**Testing**: Manual testing, Vitest (existing)
**Target Platform**: Web browser
**Project Type**: React SPA with backend API
**Performance Goals**: Landing page loads in < 2 seconds
**Constraints**: Must maintain UX consistency with existing design system

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Code Verbosity & Clarity | PASS | Components will have clear names and comments |
| II. User Experience Consistency | PASS | Landing page follows existing dark theme and design patterns |
| III. Requirement-Driven Prototyping | PASS | Each FR addressed; frontend-only implementation |

## Project Structure

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── components/
│   │   ├── LandingPage.jsx      # NEW: Landing page component
│   │   ├── PricingCard.jsx      # NEW: Pricing display component
│   │   ├── RateLimitBanner.jsx   # NEW: Rate limit status display
│   │   ├── VoucherRedeem.jsx    # NEW: Voucher redemption form
│   │   └── ...
│   ├── pages/
│   │   └── Landing.jsx          # NEW: Landing page route
│   ├── App.jsx                  # Modified: Add routing
│   └── ...
```

**Structure Decision**: Single-page React app with component-based structure. Landing page as a new top-level component shown before authentication.

## Phase 0: Research

### Research: React Routing

**Decision**: Use conditional rendering based on auth state (no react-router-dom needed)

**Rationale**:
- App already has conditional rendering based on auth state
- Simpler than adding routing library
- Landing page is shown to unauthenticated users

### Research: Rate Limit Display Location

**Decision**: RateLimitBanner shown in header area when user is authenticated

**Rationale**:
- Visible on all authenticated pages
- Doesn't interfere with chat interface
- Header is already visible throughout the app

## Phase 1: Design & Contracts

### Data Model (Entities from Spec)

| Entity | Fields | Notes |
|--------|--------|-------|
| RateLimitStatus | tier: string, remaining: int, reset: timestamp | Derived from API response headers |
| VoucherRedemptionForm | code: string | User input for voucher code |
| PricingPlan | name: string, requests: int, window: string, price: string | Display tier info |

### Interface Contracts

**Rate Limit Display**:
- Shows: "X requests remaining" or "Rate limit reached"
- Warning state when 1-2 requests remaining
- Exhausted state includes upgrade prompt with DEMO code

**Landing Page Sections**:
- Hero: Value proposition + CTA button
- Features: What Decidely.ai does
- Pricing: Three tiers (Guest, Registered, Upgraded)
- CTA: Navigation to authentication/decision interface

## Complexity Tracking

> No constitution violations requiring justification.