# Cloudflare Free guardrails

This repository is operated on the Cloudflare Workers Free plan. Autonomous operations must stop well before the platform limits and must never create billable services or modify production without explicit approval.

## Versioned policy

The machine-readable policy is `config/cloudflare-free-guardrails.json`. The Quality workflow validates it on every pull request.

Official limits are recorded for Workers, D1, R2 and Workers Builds. Daily limits reset at 00:00 UTC. The source URLs and verification date are stored in the policy file.

## Autonomous safety margins

The internal caps are deliberately lower than the Cloudflare Free limits:

- one remote D1 staging operation per UTC day;
- no more than 1,000,000 estimated D1 rows read per operation;
- no more than 25,000 estimated D1 rows written per operation;
- no more than 10,000 statements in one D1 batch;
- one OSINT acquisition per UTC day, with at most 500 records;
- at most one Cloudflare deployment per UTC day when a deployment workflow is separately approved;
- R2 writes disabled;
- production writes disabled;
- DNS writes disabled;
- secret changes disabled;
- payments and paid-plan activation disabled.

The D1 caps represent at most 20% of the free daily read allowance and 25% of the free daily write allowance for a single autonomous staging operation.

## Enforced controls

`scripts/cloudflare-free-guardrails.mjs` provides the following gates:

- validates the policy and its safety margins;
- rejects OSINT acquisitions above 500 records;
- estimates D1 package and batch usage before remote execution;
- checks GitHub Actions history to prevent more than one D1 staging run in a UTC day;
- rejects autonomous Cloudflare deployment, DNS-write or R2-write commands in GitHub workflows;
- requires Cloudflare preview URLs to remain disabled;
- requires observability to remain enabled.

The D1 staging workflow must run these gates before any remote Cloudflare mutation. Normalization and local builds do not consume D1 read or write quotas.

## Approval boundary

Autonomous work is permitted only in `agent/**` branches and staging, with pull requests, required checks and auto-merge after green checks.

Fresh explicit approval remains mandatory for:

- production database changes;
- publishing data;
- DNS changes;
- creating or changing secrets;
- paid-plan activation or payments;
- permanent deletion;
- enabling R2 writes;
- increasing any autonomous cap.

A platform limit changing upstream does not automatically relax this policy. Any change must be reviewed and merged through the protected `main` branch.
