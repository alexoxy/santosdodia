# Reviewed branch retirement — 2026-08-07

_Completed on 2026-08-07. The repository now retains only protected `main` and the Cloudflare deployment branch `cloudflare-preview`._

Ten divergent branches were retained by the generic hosting cleanup because they had commits not reachable from `main`. Their contents were reviewed before deletion; none remains a valid source of truth.

| Branch | Reviewed head | Decision |
| --- | --- | --- |
| `agent/biography-fallback-rebased` | `557584a` | Obsolete request-time Wikimedia fallback; conflicts with the closed publication boundary. |
| `agent/fix-live-localization-biographies` | `53e3e8f` | Earlier duplicate of the same obsolete fallback. |
| `agent/calendar-read-model` | `21feea5` | Useful read model already extracted and hardened in PR #21. |
| `agent/osint-data-platform-foundation` | `5f3513a` | Core files are already in `main`; workflow and package differences are superseded. |
| `agent/osint-wikidata-normalization-phase2` | `cd3d93a` | Normalizer, schema and tests are already in `main`; workflow is superseded. |
| `agent/security-litcal-hardening` | `9ab5b49` | Security fixes are present in the current lockfile and staging-only workflow; branch workflow is older. |
| `agent/production-hardening` | `738026d` | Dropbox setup documentation is superseded by the bounded App Folder archive design. |
| `agent/wikidata-pilot-archive` | `773b000` | Branch has no file-level difference from `main`. |
| `automation/osint-candidates` | `ddc1955` | Contains only a generated snapshot, which repository policy forbids retaining in Git. |
| `codex/evaluate-all-code-in-main` | `fc96874` | Abandoned JavaScript conversion predating the current TypeScript/Next/Cloudflare architecture. |

Deletion is guarded by exact full SHAs, an unchanged `main` SHA and absence of open pull requests. `main` and `cloudflare-preview` are excluded from the target allowlist.

The one-time workflow and deletion scripts were removed after Dropbox receipts were verified and the branch inventory confirmed the expected two surviving refs. This document is the durable audit trail.
