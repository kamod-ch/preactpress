# Design spec · Playground plugin marketing landing

## What

One-page marketing landing for **`@preactpress/plugin-playground`**: explain why doc authors want live Preact examples, show the split editor/preview pattern, drive install + MDX snippet.

## Audience

Maintainers of Preact libraries and internal design systems who write MDX docs and want runnable demos without a separate CodeSandbox link.

## Core messages

1. Live Preact in MDX — edit code, see preview instantly.
2. Sandboxed iframe + CDN allowlist — safe defaults for public docs.
3. Multi-file examples, optional dependencies, lazy-loaded UI.
4. Two-minute setup: plugin line + `<Playground />`.

## Tone

Technical but welcoming; credibility over hype. German UI copy optional later — **this round is English** to match package README.

## Format

Single scrolling landing, **1440px primary**, responsive to **375px**. Static HTML deliverable (not wired into PreactPress build).

## Constraints

- Use real product names and facts from `product-facts.md`.
- PreactPress wordmark via repo SVG path (no invented logo).
- No fake star counts or quote cards.

## Form (from content)

| Question | Answer |
|----------|--------|
| Narrative role | Product plugin page, not full PreactPress homepage |
| Viewer distance | Practitioner evaluating a docs add-on |
| Visual temperature | Cool/neutral dev-tool baseline; three directions diverge |
| Capacity | Hero + 3 capability blocks + setup strip + footer links |
| Motif | **Split pane: code ↔ preview** (intrinsic to the product) |
