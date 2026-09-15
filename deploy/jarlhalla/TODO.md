# Jarlhalla Platform TODO

## Immediate blockers
- [ ] Repair and verify `jarlhalla-stats.timer` and `jarlhalla-stats.service`.
- [ ] Confirm the active `jarlhalla.com` Nginx vhost writes to `/var/log/nginx/jarlhalla.com.access.log`.
- [ ] Verify AWStats and Webalizer produce non-empty reports.
- [ ] Verify Stalwart permanent administrator login and remove the temporary recovery credential only after successful permanent login.

## JarlhallaAI
- [ ] Pull the latest `jarlhalla-platform` branch to the VPS and redeploy the admin/AI service.
- [ ] Configure `OPENAI_API_KEY` in `/etc/jarlhalla-ai.env` locally on the VPS.
- [ ] Configure `ANTHROPIC_API_KEY` in `/etc/jarlhalla-ai.env` locally on the VPS.
- [ ] Use `gpt-5.6-sol` as the OpenAI default model unless cost/latency requirements favor another model.
- [ ] Use `claude-sonnet-5` as the Anthropic default model unless a different Claude tier is preferred.
- [ ] Verify `/health` reports OpenAI and Anthropic as configured.
- [ ] Run one direct OpenAI inference test through JarlhallaAI.
- [ ] Run one direct Claude inference test through JarlhallaAI.
- [ ] Review and pin Python provider SDK versions after successful production tests.

## Mail
- [ ] Create and verify `jarle@jarlhalla.com`.
- [ ] Configure Stalwart SMTP/IMAP TLS using the `mail.jarlhalla.com` certificate.
- [ ] Add a Certbot deploy hook to reload/restart Stalwart after certificate renewal.
- [ ] Configure and verify PTR/rDNS.
- [ ] Export Stalwart DNS records and publish SPF, DKIM and DMARC exactly as generated.
- [ ] Test inbound SMTP, authenticated submission, IMAPS and outbound TCP/25.
- [ ] Resolve the final MX target architecture before publishing MX.
- [ ] Add Stalwart data/config to the off-site backup plan.

## Statistics and operations
- [ ] Protect AWStats and Webalizer behind `admin.jarlhalla.com` authentication.
- [ ] Add AWStats/Webalizer links or cards to the Jarlhalla admin control plane.
- [ ] Integrate Search Console and analytics KPIs into the operations dashboard.
- [ ] Confirm the WordPress/Nova backup timer succeeds and perform a restore test.
- [ ] Verify `jarlhalla-go-live.timer` remains disabled while `.com` is canonical.

## Updates and hardening
- [ ] Update JarlhallaAI Python dependencies through the repository/virtualenv, not ad-hoc system Python packages.
- [ ] Audit Node dependencies and preserve the lockfile for production builds.
- [ ] Audit WordPress core/plugins/themes before applying updates; take a verified backup first.
- [ ] Review firewall/Docker published mail ports and anti-abuse/rate-limit settings.
- [ ] Add monitoring for Nginx, WordPress, JarlhallaAI, Stalwart and backup failures.
