# Plugin Update Checker (PUC) integration

To enable automatic updates for the Knokspack plugin from this GitHub repository:

1. Download PUC v5
   - Repo: https://github.com/YahnisElsts/plugin-update-checker
   - Use a stable release from the Releases page.

2. Vendor the library into your plugin at:
   lib/plugin-update-checker/

   After extraction, you should have:
   lib/plugin-update-checker/plugin-update-checker.php
   ...plus the rest of the library files.

3. Create GitHub Releases in this repository
   - Tag your release with the plugin version (e.g., 0.2.0).
   - Include a ZIP asset if you want to serve release assets.
   - Keep the Version header in wp-site-suite.php in sync with releases.

4. The plugin’s code auto-detects the library
   - If the library exists, it initializes update checks against:
     https://github.com/knoksen/knokspack (branch: main)
   - If release assets are enabled, PUC will use them.