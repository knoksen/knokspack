# Jarlhalla Ecosystem Workflow 0.1.0

An opt-in WordPress extension for the existing Jarlhalla site. It does not load
through Knokspack, activate itself, create pages, replace menus, register a second
inquiry post type, send mail, call AI, or transmit case data to another service.

## Delivered behavior

- `[jarlhalla_ecosystem]`: responsive directory of 16 mapped initiative groups.
  Six existing public entry links are preserved; unverified/private endpoints
  have no launch link. Historical initiatives are explicitly under preparation.
- Existing `jh_inquiry` records gain a restricted workflow metabox and queue.
- Areas cover building, sustainability, AI, art, research, community, learning,
  labs, publishing and general inquiries.
- Stages: new → triage → active ↔ waiting → delivered → closed. Triage/waiting
  may close with a reason; closed cases reopen through triage.
- Active/delivered work requires an administrator owner. Closing requires a note.
- Follow-up date, existing Notion task link, version and internal history.
- Nonce/capability checks, version checks and a database-backed per-case write lock.
- Plugin deactivation leaves original cases, metadata, pages and links intact.

This release completes the **case-processing portion** of the inquiry flow.
The site's existing submission form, notifications, external task transfer and
delivery are separate integration boundaries and have not been live-tested.
The Notion field is a reference, not synchronization. Notion remains the project
and task authority; WordPress holds intake and local case-processing metadata.

## Installation in staging

1. Verify a complete files/database backup and a tested restore procedure.
2. Build the ZIP with `python3 integrations/jarlhalla-ecosystem/package.py`.
3. Install that ZIP in a disposable/staging copy with the site's existing inquiry
   provider active. Activate **Jarlhalla Ecosystem Workflow** separately.
4. Confirm `jh_inquiry` remains private and its original form works. If the post
   type is absent, the plugin warns and the workflow stays disabled.
5. Add the shortcode to a private test page. Existing `/ecosystem/` is canonical;
   do not replace it automatically or create a competing public overview.
6. Run the staging acceptance checklist below before production use.

## Verification

```sh
php integrations/jarlhalla-ecosystem/tests/workflow.php
find integrations/jarlhalla-ecosystem -name '*.php' -exec php -l {} \;
mkdir -p /tmp/jh-eco-test-output
npx --yes @wp-playground/cli@3.1.61 run-blueprint \
  --blueprint integrations/jarlhalla-ecosystem/tests/blueprint.json \
  --mount "$PWD/integrations/jarlhalla-ecosystem:/wordpress/wp-content/plugins/jarlhalla-ecosystem" \
  --mount /tmp/jh-eco-test-output:/test-output
cat /tmp/jh-eco-test-output/results.txt
```

WordPress test fixtures are guarded and excluded from the installation ZIP.
CI runs syntax/state-machine checks on PHP 8.0 and 8.4. The Playground suite tests
real WordPress metadata, slashing, nonces, capability refusal, queue rendering and
stale/concurrent writes. It is not evidence of the production form or real mail.

## Staging acceptance checklist

- Existing inquiry form → one private `jh_inquiry`; no duplicate on retry.
- Admin: triage → assign → active → wait → deliver → close → reopen.
- Second browser with stale form is refused without overwriting workflow.
- Subscriber/anonymous cannot read the queue or mutate case metadata.
- Original inquiry content remains unchanged after every workflow edit.
- Mobile 360 px / desktop; keyboard focus and existing page heading hierarchy.
- Cache never serves case admin pages to an anonymous user.
- Existing TBT/SustainArc/membership/course/checkout paths regressions checked.
- Privacy notice, retention, deletion and notification ownership documented.
- Restore rehearsal and deactivation rollback verified.

## Recovery

Deactivate only this extension to remove its UI. Do not delete the original
inquiry provider or change `jh_inquiry`. Workflow metadata stays available for
recovery. A process termination during save can leave `jh_eco_lock_POSTID` in
wp_options. Confirm no save is executing, back up the option, and remove that
single stale lock through authorized maintenance. Locks are not automatically
stolen. Concurrent behavior across multiple PHP workers on production MySQL
still requires staging verification; Playground exercises the refusal paths.

The internal event history is bounded to 500 events and is not tamper-proof.
It contains actor/time/routing and operator notes; avoid unnecessary personal
information. No automatic retention or purge is introduced in this release.

## Rollout boundary

Do not activate the whole Knokspack repository ZIP to install this module.
The dedicated package contains only this extension. Existing Knokspack CI
problems and architecture PRs are independent and are not fixed or bypassed here.
