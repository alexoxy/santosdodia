# Vercel Hobby deployment workflow

This project is operated within the Vercel Hobby limits. GitHub Actions is the continuous validation layer; Vercel is reserved for controlled visual previews and production.

## Platform constraints

As of August 2026, the relevant Vercel Hobby limits are:

- 32 builds in a rolling 3,600-second window.
- 100 deployments in a rolling 86,400-second window.
- One concurrent build.
- 45 minutes maximum build time per deployment.
- 6,000 build execution minutes included.
- Runtime logs retained for one hour, up to 4,000 rows.
- Hobby is restricted to personal, non-commercial use.

Official references:

- https://vercel.com/docs/limits
- https://vercel.com/docs/plans/hobby
- https://vercel.com/docs/project-configuration/git-configuration

## Branch roles

### `agent/**`

Daily implementation branches.

- Every push runs the GitHub `Quality` workflow.
- Vercel automatic deployments are disabled.
- Commits may be small and frequent.
- A failed GitHub run must be inspected through Actions logs and email before further feature work.

### `vercel-preview`

Controlled preview branch.

- Vercel automatic preview deployments are enabled.
- Update this branch only after the source commit passes GitHub `Quality`.
- Use one update for a coherent product block, not one update per small commit.
- Validate the preview URL, Vercel status and notification email before continuing.

### `main`

Production branch.

- Vercel production deployments are enabled.
- Update only through a reviewed and validated integration decision.
- A production deployment must not be used as a substitute for preview validation.

## Internal deployment budget

The project intentionally stays far below Vercel's hard limits:

- Maximum target: 5 preview deployments per day.
- Maximum target: 1 production deployment per day.
- No repeated redeploy attempts after a rate-limit response.
- Avoid deploying documentation-only, lint-only or intermediate commits.
- Group related UI and runtime changes into one coherent preview candidate.

## Validation sequence

### Normal development

1. Commit to `agent/**`.
2. Run GitHub `Quality` automatically.
3. Check Gmail for GitHub failure notifications.
4. If the workflow fails, inspect the exact job logs and correct the cause.
5. Continue development only after the commit is technically clean.

### Controlled preview

1. Select a coherent, GitHub-validated commit.
2. Move `vercel-preview` to that commit.
3. Wait for the single Vercel preview deployment.
4. Check the Vercel deployment state.
5. Check Gmail for Vercel and GitHub failure notifications.
6. Inspect the preview on mobile and desktop, including the health endpoint.
7. Fix failures on `agent/**`; do not repeatedly redeploy the same broken state.

### Production

1. Confirm GitHub `Quality` is green.
2. Confirm the latest controlled preview is acceptable.
3. Merge the reviewed scope to `main`.
4. Check the production Vercel deployment and Gmail.
5. Verify `/api/v1/system/status` and key public routes.

## Rate-limit handling

When Vercel returns `build-rate-limit` or a deployment limit:

- Treat it as a platform-capacity event, not a code failure.
- Do not retry in a loop or create empty commits.
- Continue validation through GitHub Actions on `agent/**`.
- Wait for the rolling one-hour or 24-hour window to clear.
- Submit only the latest coherent candidate after the limit clears.

## Current project configuration

`vercel.json` uses minimatch rules:

```json
{
  "git": {
    "deploymentEnabled": {
      "**": false,
      "main": true,
      "vercel-preview": true
    }
  }
}
```

The broad `**` rule disables nested branches such as `agent/daily-home-foundation`. Exact `true` rules allow `main` and `vercel-preview`; Vercel applies a deployment when at least one matching rule is `true`.

The GitHub `Quality` workflow validates this policy on every supported push so accidental configuration drift fails before deployment.

## Commercial-use checkpoint

The current Hobby plan is suitable only while Santos do Dia remains personal and non-commercial. Before enabling advertising, paid virtual candles, paid subscriptions, sponsorship or any other financial-gain feature, the project must move to a commercial-compatible Vercel plan or another hosting arrangement.
