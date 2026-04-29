# Quickstart: Landing Page Navigation and Animations

## Overview

Add smooth section navigation and engaging animations to the existing landing page.

## Prerequisites

- Node.js 18+
- framer-motion (already in `frontend/package.json`)

## Files to Modify

1. **`frontend/src/components/LandingPage.jsx`** - Add section IDs, integrate Navbar
2. **`frontend/src/components/Navbar.jsx`** - Create new navigation component (NEW)

## Implementation Steps

### Step 1: Create Navbar Component

Create `frontend/src/components/Navbar.jsx`:

```jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const navLinks = [
  { id: 'hero', label: 'Make Better Decision', href: '#hero-section' },
  { id: 'how-it-works', label: 'How It Works', href: '#how-it-works-section' },
  { id: 'pricing', label: 'Pricing', href: '#pricing-section' },
  { id: 'get-started', label: 'Get Started', href: '#get-started-section' },
];

export default function Navbar() {
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3 }
    );

    document.querySelectorAll('section[id]').forEach((section) => {
      observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {navLinks.map((link) => (
        <a
          key={link.id}
          href={link.href}
          className={activeSection === link.id ? 'active' : ''}
        >
          {link.label}
        </a>
      ))}
    </motion.nav>
  );
}
```

### Step 2: Update LandingPage with Section IDs

In `LandingPage.jsx`, update each `<section>` to have an `id` attribute:

- Hero section: `id="hero-section"`
- How It Works section: `id="how-it-works-section"`
- Pricing section: `id="pricing-section"` (already has this)
- Get Started section: `id="get-started-section"`

### Step 3: Add Entrance Animations

Use framer-motion `motion` components:

```jsx
import { motion } from 'framer-motion';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

<motion.div
  initial="hidden"
  animate="visible"
  variants={fadeInUp}
  transition={{ duration: 0.5 }}
>
  {/* Animated content */}
</motion.div>
```

### Step 4: Add Scroll-Triggered Animations

```jsx
<motion.div
  viewport={{ once: true, margin: '-100px' }}
  initial="hidden"
  whileInView="visible"
  variants={fadeInUp}
>
  {/* Content that animates when scrolled into view */}
</motion.div>
```

## Testing

```bash
cd frontend
npm run dev
```

Verify:
- Navbar appears fixed at top
- Clicking navbar links scrolls smoothly to sections
- Active section is highlighted in navbar
- Elements animate on scroll
- Hover effects work on buttons
