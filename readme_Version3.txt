=== Knokspack ===
Contributors: knoksen
Requires at least: 6.0
Tested up to: 6.6
Requires PHP: 7.4
Stable tag: 0.2.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Knokspack admin app integrated into wp-admin with a sidebar menu. Optional frontend embedding via shortcode.

== Description ==
- Adds a “Knokspack” top-level admin menu with submenus (Dashboard, AI Assistant, Security, Performance, Newsletter, CRM, Analytics, Wireframe, Promotion, Growth, Backup, Search, Team, Social, Video, Mobile, Account).
- Renders your React SPA inside wp-admin.
- Provides shortcode [knokspack] to render the app on the frontend.
- Supports auto-updates from GitHub via Plugin Update Checker (if vendored).

== Installation ==
1. Build assets:
   - npm install
   - npm run build
   - This creates dist/ with manifest.json and bundled assets.

2. Package the plugin folder (containing at least):
   - wp-site-suite.php
   - dist/
   - (optional) lib/plugin-update-checker/ (for auto-updates)

3. Upload the ZIP via WordPress Admin → Plugins → Add New → Upload Plugin.

== Usage ==
- wp-admin: Use the “Knokspack” menu. Each submenu opens a section of the SPA.
- Frontend: Add [knokspack] to a page/post. The app will mount and load assets.

== Auto Updates ==
Option A: Vendor Plugin Update Checker (PUC)
- Download: https://github.com/YahnisElsts/plugin-update-checker
- Place it in lib/plugin-update-checker/
- Create GitHub Releases with tags matching the plugin Version.
- The plugin auto-initializes update checks if the library is present.

Option B: Use the “Git Updater” plugin to manage updates from GitHub.

== Changelog ==
= 0.2.0 =
- Add wp-admin menu + submenus.
- Load SPA inside admin pages and via shortcode.
- Vite manifest-based asset loader.
- GitHub auto-update support (when PUC is vendored).