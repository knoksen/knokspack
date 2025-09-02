# Security Policy

We take the security of this project seriously and appreciate coordinated, responsible disclosure.

## Supported Versions

The table below lists which versions currently receive security updates.

| Version | Supported          |
| ------- | ------------------ |
| 5.1.x   | :white_check_mark: |
| 5.0.x   | :x:                |
| 4.0.x   | :white_check_mark: |
| < 4.0   | :x:                |

> **Backports:** Critical fixes may be backported to the oldest supported branch at our discretion.

---

## Reporting a Vulnerability

**Preferred:** Open a private report via **GitHub → Security → Report a vulnerability** (creates a draft GitHub Security Advisory visible only to maintainers).

**Alternative:** Email us at **security@[your-domain]** with the subject `VULN REPORT: <project>`. If you need encryption, include your PGP key or request ours.

Please include:

- A clear description of the issue and **impact**
- **Steps to reproduce** (PoC, minimal code, sample inputs)
- **Affected versions/commit** and environment details (OS, runtime, config)
- Suggested mitigation or patch idea (if any)
- Your contact info for follow-up and (optional) how you’d like to be credited

### Our Commitment & Timeline (SLA)

- **Acknowledgement:** within **2 business days**
- **Triage & initial assessment:** within **5 business days**
- **Status updates:** at least **every 7 days** until resolution
- **Target fix windows** (from triage):
  - **Critical:** 7 days
  - **High:** 14 days
  - **Medium:** 30 days
  - **Low:** 90 days

If timelines must change (complexity, upstream deps), we’ll keep you informed.

### Disclosure Process

- We follow **coordinated disclosure**. Please do not publicly disclose details until a fix is released and an upgrade path is available.
- When resolved, we will:
  - Publish a new release with notes describing the impact, CVSS score, and upgrade instructions.
  - Update the GitHub Security Advisory and, if appropriate, request a **CVE** via GitHub.
  - Credit reporters by name/handle if you wish.

---

## Scope

Reports we’re most interested in:

- Remote code execution, auth bypass, privilege escalation
- Injection (SQL/NoSQL/Code), deserialization, SSRF, path traversal
- Data exposure, broken access control, crypto weaknesses
- Supply-chain issues (malicious/typo-squatted deps, publish-time tampering)
- Logic flaws leading to security impact

### Out of Scope (examples)

- DoS via volumetric traffic or automated fuzzing that degrades service
- Self-XSS, clickjacking on non-sensitive pages, missing security headers without practical exploit
- Issues requiring a rooted device, non-default debug builds, or unrealistic configs
- Vulnerabilities in **third-party dependencies** without a demonstrable impact on this project (please report upstream)

---

## Handling of Dependencies

We use ecosystem tooling (e.g., Dependabot/GHSA) to track vulnerable dependencies. If you find a dependency issue that materially affects this project, please report it with a clear exploit path in our context.

---

## Safe Harbor

We will not pursue or support legal action for good-faith research that:

- Respects this policy and privacy of users/data
- Avoids data destruction or service disruption
- Uses only the minimum access necessary
- Refrains from public disclosure until a fix is available

If in doubt, contact us before testing.

---

## Version Support & Updates

- Security fixes are released as patch/minor versions on supported branches (see table above).
- We may end support for versions with EOL runtimes or major architectural changes; such changes will be announced in release notes.

---

_Last updated: 2025-09-02 (Europe/Oslo)._
