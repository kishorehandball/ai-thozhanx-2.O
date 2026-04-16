# KOLARU AI 2.0 – For Students (UNGAL AI NANBAN)

## Direction
Minimalist tech platform blending Claude AI + Canva aesthetics. Glassmorphism signals cutting-edge AI without neon excess. Bold gradients tempered by refined typography and restrained layout. Dark mode default with persistent light mode toggle.

## Tone & Differentiation
Academic-focused AI platform for fast, accessible content generation. 3D hover interactions, gradient text accents, floating particles, and glassmorphic cards create distinctive, memorable experience. Emphasis on speed and clarity over decoration.

| Token | Light | Dark |
|---|---|---|
| Background | `0.99 0 0` (white) | `0.10 0.01 265` (deep blue-black) |
| Foreground | `0.1 0.01 265` (deep blue) | `0.95 0 0` (near white) |
| Primary (Blue) | `0.55 0.22 258` | `0.65 0.24 258` |
| Secondary (Purple) | `0.58 0.24 292` | `0.68 0.26 292` |
| Accent (Cyan) | `0.60 0.22 205` | `0.70 0.24 205` |
| Muted | `0.92 0.01 260` | `0.25 0.02 270` |
| Destructive | `0.55 0.22 25` | `0.65 0.19 22` |

## Typography
**Display**: Space Grotesk (bold, geometric, 900–700). **Body**: Plus Jakarta Sans (refined, 400–600). **Mono**: JetBrains Mono (code blocks, 400–700). 4-tier scale: 48px hero, 32px section head, 18px body, 14px caption.

## Shape Language & Radius
Primary radius: 8px (rounded cards, inputs). Accent radius: 0px (crisp badge edges). Spacing: 4px/8px/12px/16px/24px grid. Soft corners on interactive surfaces, sharp accents on status indicators.

## Structural Zones
| Zone | Treatment | Purpose |
|---|---|---|
| Header | `bg-card/50 backdrop-blur-md border-b` | Logo + dark/light toggle, sticky navigation |
| Hero | `bg-gradient-primary text-primary-foreground` | Gradient text hero, CTA button |
| Content Grid | Alternating `bg-card` + `bg-muted/20` | Module cards in 3-col layout (2 mobile, 4 desktop) |
| Card | `.glassmorphism` | `bg-white/10 backdrop-blur-md border border-white/20`, `.card-3d` hover |
| Footer | `bg-muted/40 border-t` | Credit, copyright, social links |

## Component Patterns
- **Primary CTA**: Solid gradient (`from-primary to-accent`), `text-white`, `rounded-md`, `.shadow-glow`
- **Secondary**: Outline `border-primary text-primary`, hover to light bg
- **Cards**: `.glassmorphism .card-3d`, `p-6`, flex column layout
- **Input**: `bg-input border-border`, focus ring on `ring-primary`
- **Badge**: Sharp corners, `text-xs font-medium`, color-coded by status

## Motion & Interaction
**Entrance**: Fade-in stagger on module cards (100ms delay per card). **Hover**: Cards scale 1.05, shadow deepens to `shadow-glow`. **Transition**: 300ms smooth bezier (0.4, 0, 0.2, 1). **Floating**: Particles in hero use `animate-float` (3s ease-in-out). **Loading**: Shimmer effect on skeleton screens.

## Dark Mode
Deep blue-black background (`oklch(0.10 0.01 265)`), lifted card surfaces (`oklch(0.14 0.02 270)`), increased contrast on text. Bright accent colors (cyan, purple, blue) maintain vibrance. All surfaces use `dark:` variants of base tokens.

## Color Accents (Sparingly)
Primary Blue used for CTAs and active states. Purple on hover, Secondary actions. Cyan for accent highlights, badges, and micro-interactions. White/transparent used across glassmorphism for restraint.

## Constraints
- No full-page gradients (only accent zones: hero, buttons, text)
- No drop shadows exceeding 20px blur
- Max 2 fonts per page (display + body, mono reserved for code)
- Opacity clamped to 10–30% on glass layers (never opaque)
- Animations capped at 3s (faster = more responsive)

## Signature Detail
Glassmorphism with multi-layered depth: card surfaces at 10% opacity with `backdrop-blur-md`, nested hover states that glow with primary color. AI Brain + Graduation Cap logo (future asset) anchors brand identity. Gradient text on hero CTA creates focal point.

## Final Touch
Built by KISHORE V | Copyright © 2026 KOLARU AI 2.0 – For Students (UNGAL AI NANBAN) | All rights reserved.
