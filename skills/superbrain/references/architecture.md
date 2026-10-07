# Information architecture and real pages

Start with visitor questions, not a homepage section list. Map each task to a route, content owner and next action. A separate URL is justified by a meaningful subject, service, project, audience or task. Avoid thin pages invented merely to meet a number.

Examples:

| Type | Possible routes | Important path |
| --- | --- | --- |
| Salon | `/`, `/services`, `/team`, `/booking` | treatment → price/duration → real booking provider |
| Builder | `/`, `/services`, `/projects`, `/projects/name`, `/contact` | relevant project → scope/process → quote |
| Tech product | `/`, `/product`, `/solutions`, `/pricing`, `/resources` | product explanation → suitability → trial/demo |

Define primary and footer navigation. Highlight current route. Internal route navigation uses links; local state changes use buttons. Link the same subject consistently throughout the site. Every route must survive direct URL loading and refresh, and browser back/forward must restore a sensible state.

A flersidig site can use server documents, static generation, or a client router. Avoid hash-only pseudo-pages for main navigation. Pick the site's architecture from its stack and needs. Metadata, heading hierarchy, crawlable content, loading, missing-route behavior and asset paths must work per page.

Inner pages share the brand language but change composition for their purpose. Services might use a readable comparison list; projects might use a gallery and case narrative; pricing needs explicit inclusions and limits. Do not make every page another giant homepage hero.

For forms define what actually receives the submission. Without a backend/provider, provide a truthful contact path or a visibly labelled prototype. Never show 'sent' for data that stayed in the browser. Real booking integration requires provider configuration, availability and test evidence.
