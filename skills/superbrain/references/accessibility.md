# Complete experiences across input modes

Use semantic headings, links, buttons, labels and landmarks. Essential text is present without JavaScript. Keep focus visible, logical and unobscured. Use actual controls for menus, maintain `aria-expanded`, and support dismissal and keyboard traversal where applicable.

Hover-only effects are decorative enhancements. On touch, keep all required information visible or expose a labelled tap control. A button's glow is optional; its label and action are not. Coarse-pointer adaptations should respond when device capabilities change, not only at initial load.

Honor `prefers-reduced-motion` in CSS and JavaScript, including changes while the page is open. Replace parallax, orbiting, camera motion and cursor following with a useful static composition. State feedback may remain instantaneous or use a gentle opacity change.

For automatically moving content that lasts more than five seconds alongside other content, assess WCAG 2.2.2 and provide pause/stop/hide when required. Reduced-motion support alone is not a complete substitute for this control. Avoid flashing and test any video/carousel controls.

Check contrast in real states, including glow, hover, masked backgrounds and disabled UI. Run automated checks where available, then inspect keyboard behavior and visual clarity yourself. Passing automation does not prove full conformance.
