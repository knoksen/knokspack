=== Knokspack ===
Contributors: knoksen
Tags: security, performance, backup, analytics, ai
Requires at least: 6.0
Tested up to: 6.8
Requires PHP: 8.0
Stable tag: 3.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Security, performance, backups, privacy-friendly stats, SEO, newsletter and an AI writing assistant in one toolkit.

== Description ==

Knokspack bundles the tools a small WordPress site needs:

* **Security** – basic firewall for common injection patterns, login lockout after repeated failures, activity log, daily PHP malware-signature scan.
* **Performance** – lazy-loaded images; optional page cache, script deferral and CDN rewriting (all off until you turn them on).
* **Backups** – database and file backups as ZIP files in wp-content/backups/knokspack.
* **Stats** – page views without cookies and without storing IP addresses.
* **Marketing** – SEO meta tags, newsletter sign-up shortcode `[knokspack_newsletter]`.
* **AI writing assistant** – blog posts, press releases, readme text and wireframes, using Google Gemini or any OpenAI-compatible server (OpenAI, Ollama, the Jarlhalla AI server). The API key stays on your server.

== Installation ==

1. Upload `knokspack.zip` under Plugins → Add New → Upload Plugin, and activate it.
2. Open Knokspack → Settings to add an AI key and choose which performance features to enable.
3. Open Knokspack in the admin menu for the dashboard.

== Frequently Asked Questions ==

= Where is my AI key stored? =

In this site's database (option `knokspack_ai`). It is used by the server only and is never sent to the browser.

= Does the stats module need a cookie banner? =

It sets no cookies and stores no IP addresses. Visitors are counted with a hash that changes every day.

== Changelog ==

= 3.0.0 =
* Restored the main plugin file, which was empty.
* The React admin app now loads inside WordPress (type="module", Vite manifest) and uses the signed-in WordPress user.
* AI requests go through a server-side REST endpoint; no API key is compiled into the JavaScript.
* Fixed fatal errors: missing login handler, missing firewall logger, wrong class name in the design module, wp_clear_scheduled_hooks.
* Performance: removed the .min.css/.min.js rewriting that caused 404s; page cache and script deferral are now opt-in and skip logged-in users.
* Security: lockouts are now saved, proxy headers are only trusted when enabled, OPTIONS requests are no longer blocked.
* Stats: cookie-less counting, no IP addresses stored, tables only migrated when the schema changes.
