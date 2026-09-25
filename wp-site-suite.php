<?php
/**
 * Plugin Name:       Knokspack
 * Plugin URI:        https://github.com/knoksen/knokspack
 * Description:       Security, performance, backups, stats, SEO, newsletter and an AI writing assistant in one toolkit.
 * Version:           3.0.0
 * Requires at least: 6.0
 * Requires PHP:      8.0
 * Author:            knoksen
 * Author URI:        https://knoksen.com
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       knokspack
 * Domain Path:       /languages
 *
 * @package Knokspack
 */

if (!defined('ABSPATH')) {
    exit;
}

define('KNOKSPACK_VERSION', '3.0.0');
define('KNOKSPACK_PLUGIN_FILE', __FILE__);
define('KNOKSPACK_PATH', plugin_dir_path(__FILE__));
define('KNOKSPACK_URL', plugin_dir_url(__FILE__));
define('KNOKSPACK_BASENAME', plugin_basename(__FILE__));
define('KNOKSPACK_PLUGIN_DIR', KNOKSPACK_PATH);
define('KNOKSPACK_PLUGIN_URL', KNOKSPACK_URL);
define('KNOKSPACK_INCLUDES_DIR', KNOKSPACK_PATH . 'includes/');
define('KNOKSPACK_MODULES_DIR', KNOKSPACK_PATH . 'modules/');
define('KNOKSPACK_ASSETS_URL', KNOKSPACK_URL . 'assets/');

require_once KNOKSPACK_INCLUDES_DIR . 'class-knokspack-autoloader.php';
require_once KNOKSPACK_INCLUDES_DIR . 'class-knokspack.php';
require_once KNOKSPACK_INCLUDES_DIR . 'class-knokspack-admin.php';
require_once KNOKSPACK_INCLUDES_DIR . 'class-knokspack-ai.php';
require_once KNOKSPACK_INCLUDES_DIR . 'class-knokspack-rest.php';

/**
 * Modules that are loaded. Each file instantiates its own class.
 * Files that are still empty stubs in modules/ (ads, cdn, crm, embed, growth,
 * mobile, promotion, scan, social, video) are intentionally not listed.
 */
function knokspack_modules() {
    return apply_filters('knokspack_modules', array(
        'security',
        'performance',
        'backup',
        'stats',
        'marketing',
        'search',
        'blocks',
        'design',
        'admin/stats-admin',
    ));
}

function knokspack_load_modules() {
    foreach (knokspack_modules() as $module) {
        $file = KNOKSPACK_MODULES_DIR . $module . '.php';
        if (is_readable($file) && filesize($file) > 0) {
            require_once $file;
        }
    }
}

knokspack();
knokspack_load_modules();
new Knokspack_Admin();
new Knokspack_AI();
new Knokspack_REST();

register_activation_hook(__FILE__, 'knokspack_activate');
register_deactivation_hook(__FILE__, 'knokspack_deactivate');

function knokspack_activate() {
    knokspack()->activate();
    flush_rewrite_rules();
}

function knokspack_deactivate() {
    knokspack()->deactivate();
    flush_rewrite_rules();
}
