# Tasks: Landing Page Navigation and Animations

**Feature**: Landing Page Navigation and Animations
**Branch**: `007-landing-page-nav-animation`
**Generated**: 2026-04-29
**Spec**: specs/007-landing-page-nav-animation/spec.md

## Overview

This feature enhances the Decidely landing page with:
- Fixed navbar with smooth section navigation
- Active section highlighting via scroll spy
- Engaging animations using framer-motion

## Phase 1: Setup

- [X] T001 [P] Verify framer-motion is installed in frontend/package.json

## Phase 2: Foundational

- [X] T002 [P] Review existing LandingPage.jsx structure in frontend/src/components/LandingPage.jsx
- [X] T003 [P] Review existing CSS variables in frontend/src/index.css

## Phase 3: User Story 1 - Smooth Section Navigation [US1]

**Goal**: Add fixed navbar with navigation links that smoothly scroll to sections
**Independent Test**: Click each navbar link and verify smooth scroll to correct section within 800ms

### Tasks

- [X] T004 [P] [US1] Create Navbar.jsx component with fixed positioning in frontend/src/components/Navbar.jsx
- [X] T005 [P] [US1] Define navLinks array with four section links in frontend/src/components/Navbar.jsx
- [X] T006 [US1] Add section IDs to LandingPage.jsx: hero-section, how-it-works-section, get-started-section
- [X] T007 [US1] Import and render Navbar component in frontend/src/components/LandingPage.jsx
- [X] T008 [US1] Add CSS smooth-scroll behavior in frontend/src/index.css

## Phase 4: User Story 2 - Visual Feedback on Active Section [US2]

**Goal**: Highlight the currently visible section in the navbar
**Independent Test**: Scroll through page and observe correct navbar item is highlighted

### Tasks

- [X] T009 [US2] Implement Intersection Observer scroll spy in frontend/src/components/Navbar.jsx
- [X] T010 [US2] Add active state tracking with useState in frontend/src/components/Navbar.jsx
- [X] T011 [US2] Apply active class/style to highlighted nav link in frontend/src/components/Navbar.jsx

## Phase 5: User Story 3 - Engaging Animations on Landing Page [US3]

**Goal**: Add entrance, scroll-triggered, and hover animations
**Independent Test**: Observe animations on page load, scroll, and button hover

### Tasks

- [X] T012 [P] [US3] Define animation variants (fadeInUp, staggerChildren) in frontend/src/components/LandingPage.jsx
- [X] T013 [P] [US3] Wrap hero content with motion.div for entrance animation in frontend/src/components/LandingPage.jsx
- [X] T014 [P] [US3] Wrap feature cards with motion.div and whileInView in frontend/src/components/LandingPage.jsx
- [X] T015 [US3] Add whileHover animation to CTA buttons in frontend/src/components/LandingPage.jsx
- [X] T016 [US3] Configure viewport props for scroll-triggered animations in frontend/src/components/LandingPage.jsx

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T017 Run frontend npm run dev and verify all navigation and animations work
- [ ] T018 [P] Write Navbar component tests in frontend/src/components/__tests__/Navbar.test.jsx
- [ ] T019 [P] Write LandingPage animation tests in frontend/src/components/__tests__/LandingPage.animations.test.jsx
- [ ] T020 Verify 60fps animation performance (no jank)
- [ ] T021 Test keyboard navigation and accessibility

## Dependency Graph

```
Phase 1 (Setup)
      │
      ▼
Phase 2 (Foundational)
      │
      ▼
┌─────────────────────────────────┐
│  Phase 3 (US1) - Navigation    │◄─── MVP (independent)
└─────────────────────────────────┘
      │
      ▼
┌──────────────┬──────────────────┐
│ US2 - Active │ US3 - Animations │ (can run in parallel)
└──────────────┴──────────────────┘
      │                │
      └───────┬────────┘
              ▼
Phase 6 (Polish)
```

## Parallel Execution Examples

**Example 1**: US1 must complete first (required foundation):
```
Worker 1: T004, T005, T006, T007, T008 (US1 - Navigation)
```

**Example 2**: After US1 complete, US2 and US3 run in parallel:
```
Worker 1: T009, T010, T011 (US2 - Active State)
Worker 2: T012, T013, T014, T015, T016 (US3 - Animations)
```

## Summary

| Metric | Value |
|--------|-------|
| Total Tasks | 21 |
| User Story 1 Tasks | 5 |
| User Story 2 Tasks | 3 |
| User Story 3 Tasks | 5 |
| Parallelizable Tasks | 13 |
| MVP Scope | User Story 1 (T004-T008) |

## Independent Test Criteria

- **US1**: Click navbar link → smooth scroll to section within 800ms
- **US2**: Scroll page → correct navbar item highlighted
- **US3**: Load page → entrance animation; scroll → elements animate in; hover button → scale animation
