Title: ui: dashboard & navbar polish

Description:
This PR improves the dashboard layout and navbar behavior, adds accessibility and snapshot tests, and performs visual polish to make the app feel more modern and approachable.

Changes:
- Fix navbar overlap by making it fixed and adding global top padding to `<main>` to prevent content overlap.
- Add responsive mobile hamburger menu with accessible controls and keyboard focus styles.
- Refactor Dashboard to full-bleed hero with constrained content area (`max-w-7xl`) for cards and quick actions.
- Add ARIA labels/roles to hero, main content, and key regions; add focus-ring utilities and elevated card surfaces.
- Add a11y and snapshot tests for the Dashboard; add Navbar unit test for mobile toggle.

Testing checklist:
- [ ] Manual test: verify navbar fixed and content padding prevents overlap
- [ ] Manual test: verify mobile menu toggles and keyboard focus works
- [ ] Automated tests: unit & snapshot tests pass locally (note: Vitest intermittent worker OOM still observed in some runs)

Notes for reviewers:
- Snapshot updated for Dashboard page. If you want any different color tokens or further theme refinements, I can follow up in a separate PR.
- Heap profiling snapshots from prior investigation are in `frontend/` but are gitignored now; they were used to identify heavy transform-time modules (PostCSS/autoprefixer/caniuse).
