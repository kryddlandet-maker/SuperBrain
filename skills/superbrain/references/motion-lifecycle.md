# Own motion from input to disposal

Read for animation interruption, responsive reinitialization, pointer tracking or runtime choice. For spatial choreography use motion.md; for graphics resources use advanced-graphics.md. This chapter adds lifecycle decisions rather than another default effect list.

Choose the smallest adequate owner: CSS for bounded state transitions, Motion for application layout, GSAP for authored scroll timelines, Rive/Lottie for their authored assets and WebGL for genuinely spatial rendering. Existing project infrastructure matters. Do not run overlapping tickers or animate the same property through two engines.

## State contract

Write idle, entering, active, leaving and disposed behavior before polishing curves. Rapid input updates the current target; it must not queue obsolete animations. Reversing a CSS transition should begin at its current rendered value. Cancel or replace an owned WAAPI/timeline instance. Distinguish user-triggered decorative feedback from actual task success.

Cache local pointer geometry on entry, coalesce updates into one requestAnimationFrame and use elapsed time for settling. Stop when close to the target. Reset on leave, pointercancel, captured scroll, resize, hidden document, media preference change and disposal. No idle render loop is necessary for a small pointer light. Avoid retaining a stale rectangle after layout movement.

Framework adapters initialize after mount and call cleanup before unmount/reinitialization. Media-query listeners, event listeners, observers, timelines and GPU resources all need owners. GSAP matchMedia reverts its owned context; unrelated listeners still need removal. Lenis remains opt-in, with one clock and explicit destroy, nested scrolling and history checks.

## Static equivalents and control

Listen for live prefers-reduced-motion changes, not only the initial setting. Preserve a stationary state and complete action. For pointer decoration, coarse input can use a press state while keyboard receives an independent focus indicator.

Assess [WCAG 2.2.2 pause/stop/hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html): qualifying automatically moving content lasting more than five seconds alongside other content needs a control; automatically updating information has no five-second exemption. An effect triggered indirectly can still count as automatic. A reduced-motion media rule does not replace this assessment.

[WCAG 2.3.3 animation from interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html) is AAA: allow disabling nonessential interaction animation. Do not claim AA or whole-site conformance just because this condition is addressed.

## Verification

Observe entry, an intermediate frame, the resolved state and interrupted return. Change reduced motion while active. Change viewport and input capability. Leave the page and return through history. Check no repeated listeners, stale tracking or queued work. Inspect layout/paint costs with the real assets; transform and opacity are useful defaults, not guarantees of constant performance.

Sources: [GSAP matchMedia](https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/), [MDN RAF](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame), [web.dev animation guide](https://web.dev/articles/animations-guide), [Motion layout](https://motion.dev/docs/react-layout-animations), [Lenis](https://github.com/darkroomengineering/lenis). Runtime integrations are researched, not newly implemented in this batch.
