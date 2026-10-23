# Lantern Festival explainer implementation plan

**Goal:** Ship a source-backed, mobile-readable `/explainers/lantern-festival` candidate and expose it from the existing festival hub without touching the CTA work.

**Baseline:** `b08905a` in isolated branch `codex/lantern-festival-page-20261023`.

## Tasks

1. Add a focused source-contract test for the new route and hub link; verify it fails because the page/link do not exist.
2. Add the explainer with clear folklore/history boundaries, FAQ structured data, institutional sources, and existing internal links.
3. Add the hub's `link` value for Lantern Festival; do not change shared form or CTA code.
4. Run the focused test, Astro build, existing test suite, and local mobile/desktop page checks.
5. Review claims line by line against cited sources, inspect the final diff, and commit only the page, hub link, test, and this plan. Do not push or deploy.
