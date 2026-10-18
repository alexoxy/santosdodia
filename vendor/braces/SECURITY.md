# Local security backport

This package is based on upstream `braces` 3.0.3 (MIT). It carries the nesting-depth guard proposed in upstream pull request #89, commit `86074c6115b23609325537588006be0c7665ebf0`, addressing CVE-2026-93687 / GHSA-vfj7-8cjw-p6xm. The upstream fix was not merged or released when this backport was prepared.

The backport caps parsed brace nesting at 100 (or a lower caller-provided `maxDepth`) and throws `SyntaxError` before recursive AST walkers run. `maxDepth` cannot raise the hard cap. Revisit this vendor copy and replace it with an upstream release as soon as the maintainers publish one.
