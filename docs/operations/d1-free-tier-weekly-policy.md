# SantosDia — D1 Free-tier Weekly Operating Policy

Effective: 2026-08-24

## Binding rule

SantosDia must remain inside the Cloudflare Workers Free plan and D1 free-tier limits. Upgrading to a paid plan is not an autonomous fallback and must never be used to solve inefficient query or workflow behaviour.

Cloudflare's enforced D1 Free limits from 2026-09-01 are treated as hard ceilings:

- 5,000,000 rows read per UTC day;
- 100,000 rows written per UTC day.

Internal operating targets must remain materially below those ceilings.

## Product reality

The public liturgical and saints corpus is predominantly static. A new saint, feast, decree, calendar correction or reviewed editorial change is an exception, not a daily event. The system therefore does not need hourly or daily D1 ingestion merely because the civil date changes.

The civil date selects already-approved content. It does not create new content.

## Weekly D1 cycle

Autonomous remote D1 mutation is allowed only inside one weekly UTC operating window:

- weekday: Monday (`getUTCDay() === 1`);
- maximum autonomous remote D1 operations in that UTC day: 1;
- a workflow-local setting may tighten this limit but may never raise it;
- outside the weekly window the operation must fail closed before any remote D1 query or mutation.

Production releases remain explicit, one-shot, review-gated operations and are not authorised by the weekly autonomous window.

## Public runtime principle

Public traffic must not be allowed to become the mechanism that consumes the D1 allowance. Prefer approved repository/static materialisation and edge caching for stable calendar content. D1 should be reserved for staging, controlled publication, reconciliation and exceptional updates where it materially adds value.

A future static read-model cutover must preserve semantic equivalence with the currently approved Portugal 2026 release before D1 is removed from any public path.

## Verification cadence

Routine checks of static calendar content should be weekly. Hourly polling is inappropriate unless a specific source is genuinely time-sensitive and has an explicit exception documented with a cost/risk justification.

Health checks may remain lightweight and frequent only when they do not consume meaningful D1 rows. Any D1-heavy health probe, full-year feed verification or staging import must follow the weekly policy.

## Weekly capacity / Work continuity

When the available weekly ChatGPT/Work execution capacity is close to exhaustion:

1. stop starting new implementation work;
2. leave `main`, open PRs, workflows and alerts in a safe state;
3. update the durable project checkpoint with completed work, unresolved items and the exact next action;
4. do not spend remaining capacity on repeated static verification;
5. resume from that checkpoint in the next weekly cycle when execution capacity is available.

This rule is part of project continuity and should not require the user to restate it in later conversations.

## Immediate remediation triggered by Cloudflare notice

The Cloudflare notice received on 2026-08-24 reported that the account regularly exceeded the D1 Free daily limits before enforcement. The remediation therefore prioritises reducing autonomous frequency before considering query expansion or new data acquisition.

The account-wide D1 guard must take precedence over workflow-local values. In particular, a workflow-local `D1_MAX_OPERATIONS_PER_DAY=20` must never be able to override the global one-operation Free-tier safety boundary.

## Implemented cadence controls

- every recurring root task in the reviewed automation registry is limited to one weekly or monthly cron;
- previously hourly, quarter-hourly, six-hourly and daily static-source jobs now run once per week;
- successful weekly roots may still drive bounded event-based stages, without independent polling;
- the automation audit rejects any future recurring schedule that exceeds the at-most-weekly boundary;
- production writes remain explicit and fail-closed.

## Next implementation items

- consolidate overlapping Wikidata lanes when consumer and evidence-equivalence proofs permit deletion;
- measure actual `rows_read` and `rows_written` from remote D1 receipts where available, rather than relying only on estimates;
- migrate stable public calendar reads toward an approved static read model once semantic-equivalence tests prove no product regression;
- keep production writes explicit and fail-closed.
