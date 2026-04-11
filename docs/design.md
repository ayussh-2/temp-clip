# Design System Specification

## 1. Creative North Star: "The Quiet Curator"
This design system is built on the philosophy of **The Quiet Curator**. It rejects the noisy, high-friction patterns of the modern web in favor of a serene, utility-focused environment. We move beyond "standard" dark mode by treating the interface not as a screen, but as a physical space of soft matte surfaces and diffused light.

To move beyond the "template" look, we employ **Intentional Asymmetry** and **Tonal Depth**. Rather than boxing content into rigid, bordered grids, we use breathing room and subtle shifts in surface luminance to guide the eye. The goal is an experience that feels whispered, not shouted—authoritative through its restraint.

---

## 2. Color & Surface Philosophy
The palette is rooted in deep, charcoal foundations, punctuated by a muted sage primary accent. This is a "No-Line" system. 

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to define sections or containers. Traditional dividers and outlines are replaced by background color shifts.
- **Boundaries** are defined by nesting a `surface-container-low` section against a `surface` background.
- **Hierarchy** is achieved through the "Surface Stack" (see Section 4).

### Signature Palettes
- **Core Neutral:** `#0e0e0e` (Surface/Background). This is a deep, matte foundation that prevents eye strain.
- **The Accent (Sage):** `#b5ccbd` (Primary). Use this sparingly for high-intent actions. It should feel like a soft glow against the dark canvas.
- **The Tertiary (Limon):** `#f5fed2`. Reserved for "Moment of Delight" highlights or unique utility indicators.

### Signature Textures & Glass
While the base is flat, we utilize **Glassmorphism** for floating elements (modals, dropdowns, navigation bars). 
- Use `surface-container-highest` at 60% opacity with a `20px` to `40px` backdrop-blur. 
- Main CTAs may use a subtle, nearly imperceptible gradient from `primary` (#b5ccbd) to `primary_container` (#374b3f) to provide a "soulful" depth that pure flat color cannot replicate.

---

## 3. Typography
The system employs a dual-font strategy to balance editorial sophistication with functional clarity.

- **Display & Headlines (Manrope):** Chosen for its geometric precision and slightly wide stance. This provides the "Editorial" feel.
    - *Usage:* Use `display-lg` (3.5rem) with tighter letter-spacing (-0.02em) for hero moments.
- **Body & Interface (Inter):** The workhorse. Inter’s high x-height ensures readability against dark backgrounds where light text tends to "bloom."
    - *Usage:* `body-md` (0.875rem) is the standard for all functional data.

**Hierarchy Tip:** Always favor a larger font-size shift over a font-weight shift. Use `on_surface_variant` (#acabaa) for secondary information to create a natural visual recession without needing smaller, unreadable text.

---

## 4. Elevation & Depth: Tonal Layering
In this system, "Up" does not mean "Shadow." It means "Lighter."

### The Layering Principle
Depth is achieved by stacking surface tiers. To create a card-like effect without a border:
1. **Base Layer:** `surface` (#0e0e0e)
2. **Section Layer:** `surface_container_low` (#131313)
3. **Component Layer:** `surface_container` (#191a1a) or `surface_container_high` (#1f2020)

### Ambient Shadows
If a floating element (like a Dialog) requires a shadow, it must be **Ambient**:
- **Color:** A tinted version of `surface_container_lowest` (#000000) at 40% opacity.
- **Blur:** 40px–60px.
- **Spread:** -10px (to keep it tucked and soft).

### The "Ghost Border" Fallback
If contrast testing fails, use a **Ghost Border**: `outline_variant` (#484848) at **15% opacity**. This provides a hint of a boundary without breaking the "No-Line" rule.

---

## 5. Components

### Buttons
- **Primary:** Background: `primary` (#b5ccbd) | Text: `on_primary` (#304539). Use `md` (0.375rem) roundedness.
- **Secondary:** Background: `secondary_container` (#3c3b3b) | Text: `on_secondary_container` (#c1bfbe).
- **Tertiary:** No background. Text: `primary`. Interaction state is indicated by a subtle `surface_container_high` ghost-fill on hover.

### Input Fields
- **Container:** `surface_container_highest` (#252626).
- **Style:** Flat, no border. Focus state is indicated by a 2px bottom-bar in `primary`, rather than a full-box outline.
- **Labels:** Always use `label-md` in `on_surface_variant`.

### Cards & Lists
- **Rule:** Forbid divider lines. 
- **Execution:** Separate list items with `1rem` of vertical whitespace. For complex data, use alternating tonal shifts (Zebra striping) using `surface_container_low` and `surface_container_lowest`.

### Signature Component: The "Curator Glass" Header
A sticky navigation element using `surface` at 70% opacity with a heavy backdrop-blur. It should not have a bottom border; instead, use a subtle `primary` glow (1px height) that only appears when the user scrolls.

---

## 6. Do’s and Don'ts

### Do
- **Do** use asymmetrical margins (e.g., a wider left gutter than right) to create an editorial, high-end feel.
- **Do** use `tertiary_container` for subtle "success" or "new" indicators; it feels more sophisticated than standard green.
- **Do** ensure all interactive elements have a minimum touch target of 44px, even if the visual element is smaller.

### Don't
- **Don't** use pure white (#FFFFFF) for text. Use `on_surface` (#e7e5e5) to reduce "halation" on dark backgrounds.
- **Don't** use 100% opaque borders. They clutter the UI and break the calm, utility-focused spirit.
- **Don't** use standard "Drop Shadows." If it doesn't look like ambient light, it doesn't belong in this system.