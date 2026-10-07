# Typography and layout craft

Clean is a relationship between elements, not a fixed amount of whitespace. Start with the information that matters and give it an appropriate hierarchy. More breathing room cannot compensate for missing structure.

## Choose roles before fonts

Define a display role, reading role and optional technical/label role. The same family can fill multiple roles when weights, scale and rhythm create enough distinction. Use a separate display family when it contributes the right voice, not merely to satisfy a pairing rule.

Try candidate fonts with actual headings and body copy. Check Swedish å, ä, ö, long compounds, numbers, prices and mixed case. A fashionable font can still feel wrong for the audience. Match the direction's personality: warm, precise, editorial, rugged, quiet or playful.

Use local/hosted licensed files when relevant, few useful weights, stable fallback metrics and appropriate loading. System fonts are useful for fast prototypes but not an automatic final identity. Do not load numerous families just to make sections look different.

## Type rhythm

Use a responsive scale, then adjust it to the composition. `clamp()` can handle intermediate widths, but it does not guarantee good line breaks. Large negative tracking is mostly a display decision; applying it to reading text damages clarity. Short display lines can use tight leading; paragraphs need comfortable leading and measure.

Body measure around 45–75 characters can be a starting hypothesis, adjusted for type, size and content. Avoid treating it as a universal compliance threshold. Long informational copy may need a narrower column even on a wide screen. Do not fill the available width simply because a grid permits it.

Use manual heading breaks only when their responsive result has been inspected. At a narrow viewport, an intentional desktop line break may make a bad composition. Consider responsive break behavior instead of shrinking until it fits.

## Layout rhythm

Align meaningful edges: heading, body column, image crop, navigation and CTA. Shared alignment can unify sections more quietly than borders. A regular grid provides anchors, while selected departures create emphasis.

Create contrast through scale, density and media position. A page may move from a generous hero to a readable service list, a large photo, a compact explanation and a quiet final CTA without switching background on every beat.

Set space according to relationship. A caption belongs near its image; a section heading and its first paragraph belong together; unrelated topics need more separation. An 8px scale is an engineering aid, not a requirement to give every section the same padding.

## Common repairs

| Observation | Investigate before adding decoration |
| --- | --- |
| Everything looks equal | Distinguish heading levels, primary action and reading hierarchy |
| The site feels fragmented | Remove unmotivated surface changes; align shared edges; continue material |
| Too much empty space | Reduce automatic viewport-height sections; relate space to real content |
| Typography feels cheap | Try actual copy in another voice, then fix weight, measure and line breaks |
| Mobile looks squeezed | Recompose columns, crops and type size; remove forced desktop breaks |
| Every page feels identical | Design each route around its task while retaining shared identity |

Review the still composition and a moving interaction together. Keep a user-approved direction unless there is a concrete reason to change it. Make a targeted before/after rather than a wholesale style reset.
