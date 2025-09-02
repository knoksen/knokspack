<?php
/**
 * Plugin Name: Knokspack
 * Description: Knokspack admin app integrated into wp-admin with a sidebar menu. Use [knokspack] shortcode for frontend embedding if desired.
 * Version: 0.2.0
 * Author: knoksen
 * Requires at least: 6.0
 * Requires PHP: 7.4
 */

if (!defined('ABSPATH')) exit;

define('KNOKSPACK_PLUGIN_VERSION', '0.2.0');
define('KNOKSPACK_PLUGIN_PATH', plugin_dir_path(__FILE__));
define('KNOKSPACK_PLUGIN_URL', plugin_dir_url(__FILE__));

function knokspack_enqueue_common_assets() {
    wp_enqueue_style(
        'knokspack-fonts',
        'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap',
        [],
        null
    );
    wp_enqueue_script(
        'knokspack-tailwind',
        'https://cdn.tailwindcss.com',
        [],
        null,
        false
    );
    $tailwind_config = <<<JS
tailwind.config = {
  theme: {
    extend: {
      colors: {
        'knokspack-dark': '#111827',
        'knokspack-primary': '#3B82F6',
        'knokspack-primary-light': '#DBEAFE',
        'knokspack-gray': '#6B7E93',
        'knokspack-light-gray': '#F3F6F8',
      },
      fontFamily: { sans: ['Inter', 'sans-serif'] },
      animation: {'blob': 'blob 7s infinite'},
      keyframes: {
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        }
      }
    },
  },
}
JS;
    wp_add_inline_script('knokspack-tailwind', $tailwind_config, 'after');
}

function knokspack_enqueue_app_assets() {
    $manifest_path = KNOKSPACK_PLUGIN_PATH . 'dist/manifest.json';
    if (!file_exists($manifest_path)) return;

    $manifest = json_decode(file_get_contents($manifest_path), true);
    if (!is_array($manifest) || !isset($manifest['index.html'])) return;

    $entry = $manifest['index.html'];
    $entry_js = isset($entry['file']) ? $entry['file'] : null;

    if ($entry_js) {
        $handle = 'knokspack-app';
        wp_register_script(
            $handle,
            KNOKSPACK_PLUGIN_URL . 'dist/' . ltrim($entry_js, '/'),
            [],
            KNOKSPACK_PLUGIN_VERSION,
            true
        );
        add_filter('script_loader_tag', function ($tag, $h, $src) use ($handle) {
            if ($h === $handle) {
                return '<script type="module" src="' . esc_url($src) . '"></script>';
            }
            return $tag;
        }, 10, 3);

        if (!empty($entry['css']) && is_array($entry['css'])) {
            foreach ($entry['css'] as $css) {
                wp_enqueue_style(
                    'knokspack-style-' . md5($css),
                    KNOKSPACK_PLUGIN_URL . 'dist/' . ltrim($css, '/'),
                    [],
                    KNOKSPACK_PLUGIN_VERSION
                );
            }
        }

        if (!empty($entry['imports']) && is_array($entry['imports'])) {
            foreach ($entry['imports'] as $importKey) {
                if (!empty($manifest[$importKey]['file'])) {
                    $chunk_file = $manifest[$importKey]['file'];
                    $chunk_handle = 'knokspack-chunk-' . md5($chunk_file);

                    wp_register_script(
                        $chunk_handle,
                        KNOKSPACK_PLUGIN_URL . 'dist/' . ltrim($chunk_file, '/'),
                        [],
                        KNOKSPACK_PLUGIN_VERSION,
                        true
                    );
                    add_filter('script_loader_tag', function ($tag, $h, $src) use ($chunk_handle) {
                        if ($h === $chunk_handle) {
                            return '<script type="module" src="' . esc_url($src) . '"></script>';
                        }
                        return $tag;
                    }, 10, 3);
                    wp_enqueue_script($chunk_handle);
                }
            }
        }

        wp_enqueue_script($handle);
    }
}

function knokspack_shortcode() {
    knokspack_enqueue_common_assets();
    knokspack_enqueue_app_assets();
    return '<div id="knokspack-root"></div>';
}
add_shortcode('knokspack', 'knokspack_shortcode');

function knokspack_routes() {
    return [
        'dashboard'   => '/dashboard',
        'ai-assistant'=> '/ai-assistant',
        'security'    => '/security',
        'performance' => '/performance',
        'newsletter'  => '/newsletter',
        'crm'         => '/crm',
        'analytics'   => '/analytics',
        'wireframe'   => '/wireframe',
        'promotion'   => '/promotion',
        'growth'      => '/growth',
        'backup'      => '/backup',
        'search'      => '/search',
        'team'        => '/team',
        'social'      => '/social',
        'video'       => '/video',
        'mobile'      => '/mobile',
        'account'     => '/account',
    ];
}

function knokspack_admin_menu() {
    add_menu_page(
        'Knokspack',
        'Knokspack',
        'manage_options',
        'knokspack',
        'knokspack_render_admin_page',
        'dashicons-robot',
        56
    );

    $labels = [
        'dashboard'=>'Dashboard','ai-assistant'=>'AI Assistant','security'=>'Security','performance'=>'Performance',
        'newsletter'=>'Newsletter','crm'=>'CRM','analytics'=>'Analytics','wireframe'=>'Wireframe','promotion'=>'Promotion',
        'growth'=>'Growth','backup'=>'Backup','search'=>'Search','team'=>'Team','social'=>'Social','video'=>'Video',
        'mobile'=>'Mobile','account'=>'Account',
    ];

    foreach ($labels as $key => $label) {
        add_submenu_page(
            'knokspack',
            "Knokspack – $label",
            $label,
            'manage_options',
            'knokspack-' . $key,
            'knokspack_render_admin_page'
        );
    }
}
add_action('admin_menu', 'knokspack_admin_menu');

function knokspack_is_admin_page() {
    $page = isset($_GET['page']) ? sanitize_text_field($_GET['page']) : '';
    return (strpos($page, 'knokspack') === 0);
}

function knokspack_current_route() {
    $page = isset($_GET['page']) ? sanitize_text_field($_GET['page']) : 'knokspack';
    if ($page === 'knokspack') return '/dashboard';
    $prefix = 'knokspack-';
    if (strpos($page, $prefix) === 0) {
        $key = substr($page, strlen($prefix));
        $routes = knokspack_routes();
        if (isset($routes[$key])) return $routes[$key];
    }
    return '/dashboard';
}

function knokspack_admin_enqueue($hook) {
    if (!knokspack_is_admin_page()) return;
    knokspack_enqueue_common_assets();
    knokspack_enqueue_app_assets();
}
add_action('admin_enqueue_scripts', 'knokspack_admin_enqueue');

function knokspack_render_admin_page() {
    $route = knokspack_current_route();
    echo '<div class="wrap">';
    echo '<h1 style="display:none">Knokspack</h1>';
    echo '<div id="knokspack-root"></div>';
    echo '<script>(function(){var r=' . json_encode($route) . '; if(r && (!location.hash || location.hash==="#" || location.hash==="#/")){ location.hash = "#"+r; }})();</script>';
    echo '</div>';
}

function knokspack_init_updater() {
    $puc = KNOKSPACK_PLUGIN_PATH . 'lib/plugin-update-checker/plugin-update-checker.php';
    if (file_exists($puc)) {
        require_once $puc;
        $updateChecker = \YahnisElsts\PluginUpdateChecker\v5\PucFactory::buildUpdateChecker(
            'https://github.com/knoksen/knokspack',
            __FILE__,
            'knokspack'
        );
        $updateChecker->setBranch('main');
        $api = $updateChecker->getVcsApi();
        if (method_exists($api, 'enableReleaseAssets')) {
            $api->enableReleaseAssets();
        }
    }
}
add_action('init', 'knokspack_init_updater');