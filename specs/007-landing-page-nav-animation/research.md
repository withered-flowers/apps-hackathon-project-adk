# Research: Landing Page Navigation and Animations

## Animation Library Selection

**Decision**: framer-motion (already installed)

**Rationale**: The project already has `framer-motion@^12.38.0` in dependencies. This library provides:
- Smooth scroll animations via `useScroll` and `useTransform`
- Scroll-triggered animations via `motion` components with `whileInView`
- Hover animations via `whileHover`
- Active section detection via Intersection Observer hooks

**Alternatives considered**:
- lottie-react: Requires external Lottie animation JSON files; framer-motion is more flexible for programmatic animations
- CSS animations: Less flexible for scroll-triggered and intersection-based animations

## Smooth Scroll Implementation

**Decision**: Native CSS `scroll-behavior: smooth` + framer-motion for enhanced effects

**Rationale**: Modern browsers support smooth scrolling natively. framer-motion can enhance with spring physics for a more premium feel.

**Implementation approach**:
- CSS: `html { scroll-behavior: smooth; }`
- framer-motion `scrollY` progress tracking for navbar active states

## Scroll Spy (Active Section Detection)

**Decision**: Intersection Observer API

**Rationale**:
- Native browser API, no additional dependencies
- Efficient (only observes elements in viewport)
- Well-supported across modern browsers
- Can be wrapped in a custom React hook for reusability

## Navigation Structure

**Decision**: Fixed navbar with section anchor links

**Implementation approach**:
- `<nav>` element fixed at top of page
- Each section has unique `id` attribute
- Navbar links use `<a href="#section-id">` for native scroll behavior
- framer-motion `useScroll` + `useTransform` for progress tracking
- `whileInView` for scroll-triggered section animations

## Animation Patterns

### Entrance Animations
- Hero section: staggered fade-in + slide-up for text elements
- Feature cards: staggered fade-in with 100ms delay between items
- Pricing cards: fade-in with scale from 0.95

### Hover Animations
- CTA buttons: scale(1.05) with shadow elevation
- Cards: subtle shadow lift

### Scroll Animations
- Sections fade/slide in when entering viewport
- Navbar links highlight based on scroll position

## Technical Notes

- framer-motion `useScroll` hook tracks scroll position
- `useTransform` converts scroll progress to animation values
- `motion.div` components wrap animated elements
- `viewport={{ once: true, margin: "-100px" }}` for single-trigger animations
