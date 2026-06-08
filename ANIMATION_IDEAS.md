# 🚀 Landing Page Animation Ideas

> Ideas 1 & 2 (Hero Text Entrance + TypeAnimation) have already been implemented.
> The remaining ideas below are queued for future implementation.

---

## ✅ Implemented

### 1. Hero Text Entrance Animation
Staggered `slideUp` animation on the badge, title, subtitle, and CTA buttons using CSS keyframes and `animation-delay`. The hero illustration slides in from the right with a `fadeInRight` animation.

**Files changed:**
- `src/index.css` — Added `@keyframes heroSlideUp`, `@keyframes heroFadeInRight`, and `.hero-animate` utility classes.
- `src/components/LandingPage.tsx` — Added `hero-animate` and `hero-animate-{1–4}` classes to each hero text element.

### 2. TypeAnimation on Hero Title
Uses the already-installed `react-type-animation` package to cycle through `"Playwright"` → `"Web Testing"` → `"Automation"` → `"Confidence"` with a blinking cursor in the gradient style.

**Files changed:**
- `src/components/LandingPage.tsx` — Replaced static `<span className="gradient-text">Playwright</span>` with a `<TypeAnimation>` component.

---

## 🔜 Remaining Ideas

### 3. Scroll-triggered Reveal for Feature Cards
**What:** The three feature cards (Modern Tooling, Hands-on Labs, Comprehensive) fade and slide up into view only when the user scrolls to them — rather than appearing instantly on load.

**How to implement:**
- Use the native browser `IntersectionObserver` API in a `useEffect` inside `LandingPage.tsx`.
- When each `.feature-card` enters the viewport, add a `"visible"` class.
- CSS handles the transition:

```css
.feature-card {
  opacity: 0;
  transform: translateY(40px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}
.feature-card.visible {
  opacity: 1;
  transform: translateY(0);
}
```

```tsx
useEffect(() => {
  const cards = document.querySelectorAll('.feature-card');
  const observer = new IntersectionObserver(
    (entries) => entries.forEach(e => e.isIntersecting && e.target.classList.add('visible')),
    { threshold: 0.15 }
  );
  cards.forEach(card => observer.observe(card));
  return () => observer.disconnect();
}, []);
```

**Effort:** ~30 min | **Impact:** High ⭐⭐⭐⭐

---

### 4. Mouse Parallax on Hero Image
**What:** The hero illustration subtly tilts/translates in 3D as the user moves their mouse over the hero section — making it feel alive and interactive.

**How to implement:**
- Track `onMouseMove` on `.hero-section` in `LandingPage.tsx`.
- Apply a CSS `transform: rotateY() rotateX()` to the illustration via an inline ref.

```tsx
const imgRef = useRef<HTMLImageElement>(null);

const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
  if (!imgRef.current) return;
  const rect = e.currentTarget.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width - 0.5) * 18;
  const y = ((e.clientY - rect.top) / rect.height - 0.5) * 18;
  imgRef.current.style.transform = `perspective(800px) rotateY(${x}deg) rotateX(${-y}deg) scale(1.03)`;
};

const handleMouseLeave = () => {
  if (imgRef.current) imgRef.current.style.transform = '';
};
```

```tsx
<div className="hero-section" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
  ...
  <img ref={imgRef} ... style={{ transition: 'transform 0.1s ease' }} />
```

**Effort:** ~20 min | **Impact:** High ⭐⭐⭐⭐

---

### 5. Animated Gradient Background
**What:** Replace the flat `#fafaf9` background with a slowly-shifting radial gradient mesh that gives the page a premium, living feel. Zero JS required.

**How to implement:**
- Update `.landing-container` in `src/index.css`:

```css
.landing-container {
  background:
    radial-gradient(ellipse at 15% 50%, rgba(230, 95, 43, 0.07) 0%, transparent 55%),
    radial-gradient(ellipse at 85% 10%, rgba(249, 115, 22, 0.05) 0%, transparent 55%),
    #fafaf9;
  background-size: 200% 200%;
  animation: gradientDrift 14s ease-in-out infinite alternate;
}

@keyframes gradientDrift {
  from { background-position: 0% 50%; }
  to   { background-position: 100% 50%; }
}

[data-theme='dark'] .landing-container {
  background:
    radial-gradient(ellipse at 15% 50%, rgba(230, 95, 43, 0.1) 0%, transparent 55%),
    radial-gradient(ellipse at 85% 10%, rgba(249, 115, 22, 0.07) 0%, transparent 55%),
    #0e0d0c;
  background-size: 200% 200%;
  animation: gradientDrift 14s ease-in-out infinite alternate;
}
```

**Effort:** ~10 min | **Impact:** Medium ⭐⭐⭐

---

### 6. Animated Dot-Grid / Particle Background
**What:** An animated dot-grid or floating-particle canvas behind the hero section gives a "tech/code" aesthetic.

**Option A — Pure CSS repeating dot grid:**
```css
.landing-container::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: radial-gradient(rgba(230, 95, 43, 0.12) 1px, transparent 1px);
  background-size: 28px 28px;
  animation: gridFade 6s ease-in-out infinite alternate;
  pointer-events: none;
  z-index: 0;
}

@keyframes gridFade {
  from { opacity: 0.4; }
  to   { opacity: 0.8; }
}
```

**Option B — Canvas particles:** Use a lightweight library like [`tsparticles`](https://github.com/tsparticles/tsparticles) or write a small `<canvas>` component.

**Effort:** 10–45 min depending on option | **Impact:** Medium–High ⭐⭐⭐

---

### 7. Animated Stats Counter
**What:** A stats row below the hero (e.g., `50+ Labs`, `10K+ Learners`, `5 Browsers Supported`) with numbers that count up from 0 when scrolled into view.

**How to implement:**
- Add a `<StatsCounter>` component below the hero in `LandingPage.tsx`.
- Use `IntersectionObserver` to trigger counting, and `setInterval`/`requestAnimationFrame` to animate the numbers.

```tsx
const stats = [
  { label: 'Hands-on Labs',      value: 50,    suffix: '+' },
  { label: 'Learners',           value: 10000, suffix: '+' },
  { label: 'Browsers Supported', value: 5,     suffix: ''  },
];
```

**Effort:** ~45 min | **Impact:** High ⭐⭐⭐⭐

---

## 🗂 Implementation Priority

| # | Idea | Effort | Impact |
|---|------|--------|--------|
| ✅ 1 | Hero Text Entrance (slideUp) | Done | ⭐⭐⭐⭐⭐ |
| ✅ 2 | TypeAnimation on title | Done | ⭐⭐⭐⭐ |
| 3 | Scroll-reveal feature cards | ~30 min | ⭐⭐⭐⭐ |
| 4 | Mouse parallax on hero image | ~20 min | ⭐⭐⭐⭐ |
| 5 | Animated gradient background | ~10 min | ⭐⭐⭐ |
| 6 | Dot-grid / particle background | ~10–45 min | ⭐⭐⭐ |
| 7 | Animated stats counter | ~45 min | ⭐⭐⭐⭐ |
