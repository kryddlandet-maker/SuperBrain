# Project tokens and exceptions

Generate with node scripts/design.mjs brief.json --out existing-project. Inspect the proposed result before using it as the brand identity. The generator writes semantic colors, font roles, responsive type, spacing, grids, breakpoints, radii, shadows, lighting, action states and motion presets to design-system/. MASTER.md explains decisions; tokens.json and tokens.css are generated from the same values.

Use .sb-surface, .sb-shell, .sb-heading and .sb-button as optional integration scaffolding. Native components and the project's existing stack remain authoritative. The generator never rewrites application components. Import CSS explicitly after assessing scope and cascade ownership. Font stacks are available fallbacks, not fetched brand fonts.

Brief preferences are optional numbers from 0 to 10: creativeFreedom, motionIntensity, visualComplexity, contentDensity and expressiveness. A quiet-motion brief caps motion intensity. Accent is an explicit six-digit hex color; on-accent is selected by computed contrast. Theme can be light or dark. Supplied solid-color pairs are checked numerically; real overlay and pointer-light states still need browser review.

pageExceptions maps an existing route to purpose, layout and/or density. Each page inherits shared identity and may have its own rules. Density CSS scopes --sb-page-gap using data-sb-page on that page container. Do not make a new disconnected theme for every section. Changes to the generated source should regenerate JSON and CSS together; edited managed files cause a safe refusal.

The generated files are a starting contract. Real content, loaded fonts, local component conventions and rendering may justify changes; reconcile and record them deliberately.

To supply actual authored choices, use brief.artDirection with identity, composition, imagery, displayFont, bodyFont, a three-color palette [background, ink, accent], and/or motionCharacter. Font values are validated family stacks, not executable CSS. These structured choices override profile proposals; theme/accent/preferences remain explicit later overrides. Free-text direction records an identity to interpret with Codex, rather than pretending a deterministic tool understands every visual adjective.
