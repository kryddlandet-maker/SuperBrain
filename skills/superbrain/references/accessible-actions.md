# Actions with truthful state

Read when building buttons, submission flows, toggles, disclosure navigation or composing an accessible primitive. Preserve the actual product flow; decoration is secondary to clear state.

Use a native button for an action and an anchor for navigation. Set type="button" unless submitting a form. Native buttons handle Enter and Space; adding a second keydown activation can perform the action twice. Use a stable label and aria-pressed for a persistent toggle. A label that changes from "Mute" to "Unmute" is a different action pattern.

Keep focus visible independently from fills or lighting. Check clipping, background contrast and forced colors. Native disabled controls prevent activation; aria-disabled only communicates state and requires the application to prevent activation. Avoid disabling every error recovery path.

For real asynchronous actions define idle, pending, confirmed success, error and retry. Prevent duplicate requests where needed and preserve input after failure. Announce meaningful outcomes with a suitable status region. Do not infer success from elapsed animation or a click.

Ordinary site navigation uses links and disclosure buttons, aria-expanded and predictable Tab order. Do not add application menu roles merely because a dropdown looks like a menu. Escape closes the disclosure and returns focus to its trigger. Keep mobile and touch routes available. See architecture.md for real direct routes and history.

Primitives such as Radix can provide focus and keyboard mechanics; the consumer still supplies correct labels, descriptions, composition and tasks. Test escape, focus return and actual integrated behavior. A primitive's accessibility statement does not certify the complete application.

Reusable decorative button recipes are in button-interactions.md. Async and disclosure candidates in this batch are researched patterns; they are not new production integrations.

Sources: [W3C button pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/), [W3C disclosure navigation](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/), [Radix accessibility](https://www.radix-ui.com/primitives/docs/overview/accessibility), [shadcn button](https://ui.shadcn.com/docs/components/base/button).
