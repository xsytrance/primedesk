# CSS Zen Garden notes (scraped)

Source sampled:
- https://www.csszengarden.com/
- https://www.csszengarden.com/221/221.css

## Reusable UI techniques for PrimeDesk

1. **Structure-first CSS**
- Keep HTML semantic and stable, swap visual themes purely via CSS.
- Avoid ID-heavy styling; prefer reusable classes.

2. **Pseudo-elements for depth**
- Use `::before`/`::after` for overlays, glow halos, scanlines, and decorative frames.
- Reduces extra DOM while adding visual complexity.

3. **Layered backgrounds**
- Stack multiple backgrounds (gradients + texture/noise + image) to create depth.
- Example pattern: vignette + radial accent + subtle pattern dots.

4. **Motion with restraint**
- Small easing transitions (`0.2s - 0.4s`) for hover/focus feels premium.
- Use looping animations for ambient elements (floating eye, pulse/glow) with low amplitude.

5. **Typography hierarchy**
- Distinct display vs body type; use letter spacing and casing for section identity.
- Monospace for IDs/codes; sans-serif for body copy.

6. **Responsive by design**
- Test at multiple widths.
- Prefer fluid containers + scalable spacing.

7. **Progressive enhancement**
- Base experience should remain functional without advanced effects.
- Decorative effects must be non-blocking (`pointer-events:none` where needed).

## Planned application in PrimeDesk

- Add dashboard hero panel with layered backgrounds and pseudo-element accents.
- Build Sauron eye dialogue bubble using pseudo-elements and typewriter animation.
- Enhance cards/buttons/tabs using transition and depth tokens from Atlas palette.
- Keep accessibility focus states and readable contrast under dark-mode conditions.
