# Data Model: Landing Page Navigation and Animations

## Component Structure

### Navbar Component

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | 'main-navbar' |
| `position` | string | 'fixed' |
| `links` | NavLink[] | Navigation links array |
| `activeSection` | string \| null | Currently visible section ID |
| `scrollY` | number | Current scroll position in pixels |

### NavLink Entity

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique link identifier |
| `label` | string | Display text (e.g., "Make Better Decision") |
| `href` | string | Anchor href (e.g., "#hero-section") |
| `sectionId` | string | Target section ID for scroll spy |
| `isActive` | boolean | Whether section is currently in view |

### Section Entity

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique section identifier |
| `title` | string | Section title text |
| `order` | number | Display order (0-3) |
| `isInView` | boolean | Intersection Observer state |

### Animation Configuration

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `entranceDuration` | number | 500 | Entrance animation duration in ms |
| `entranceDelay` | number | 100 | Delay between staggered elements |
| `scrollTransition` | number | 800 | Smooth scroll duration in ms |
| `hoverScale` | number | 1.05 | Scale factor on hover |
| `viewportMargin` | string | '-20%' | Intersection Observer margin |

## Landing Page Section Mapping

| Section | ID | Navbar Label | Order |
|---------|-----|--------------|-------|
| Hero | hero-section | Make Better Decision | 0 |
| How It Works | how-it-works-section | How It Works | 1 |
| Pricing | pricing-section | Pricing | 2 |
| Get Started | get-started-section | Get Started | 3 |

## State Management

- **Local Component State**: React useState for Navbar visibility and active section
- **Scroll Position**: framer-motion's useScroll hook
- **Intersection State**: Custom useInView hook wrapping Intersection Observer

## CSS Custom Properties (Existing)

The landing page uses CSS variables:
- `--color-bg-primary`
- `--color-bg-secondary`
- `--color-text-primary`
- `--color-text-muted`
- `--color-border`
