<?php
/**
 * Admin screens: the React app (Knokspack menu) and the Settings page.
 *
 * @package Knokspack
 */

if (!defined('ABSPATH')) {
    exit;
}

class Knokspack_Admin {
    const MENU_SLUG = 'knokspack';
    const SETTINGS_SLUG = 'knokspack-settings';

    public function __construct() {
        add_action('admin_menu', array($this, 'register_menu'), 5);
        add_action('admin_enqueue_scripts', array($this, 'enqueue_app'));
        add_action('admin_init', array($this, 'register_settings'));
        add_filter('script_loader_tag', array($this, 'module_type'), 10, 3);
        add_filter('plugin_action_links_' . KNOKSPACK_BASENAME, array($this, 'action_links'));
    }

    public function register_menu() {
        add_menu_page(
            __('Knokspack', 'knokspack'),
            __('Knokspack', 'knokspack'),
            'manage_options',
            self::MENU_SLUG,
            array($this, 'render_app'),
            'dashicons-shield-alt',
            30
        );
        add_submenu_page(
            self::MENU_SLUG,
            __('Dashboard', 'knokspack'),
            __('Dashboard', 'knokspack'),
            'manage_options',
            self::MENU_SLUG,
            array($this, 'render_app')
        );
        add_submenu_page(
            self::MENU_SLUG,
            __('Knokspack Settings', 'knokspack'),
            __('Settings', 'knokspack'),
            'manage_options',
            self::SETTINGS_SLUG,
            array($this, 'render_settings')
        );
    }

    public function action_links($links) {
        $url = admin_url('admin.php?page=' . self::SETTINGS_SLUG);
        array_unshift($links, '<a href="' . esc_url($url) . '">' . esc_html__('Settings', 'knokspack') . '</a>');
        return $links;
    }

    /** Reads dist/.vite/manifest.json written by `npm run build`. */
    public static function manifest() {
        $path = KNOKSPACK_PATH . 'dist/.vite/manifest.json';
        if (!is_readable($path)) {
            return null;
        }
        $data = json_decode((string) file_get_contents($path), true);
        return is_array($data) ? $data : null;
    }

    public function enqueue_app($hook) {
        if ($hook !== 'toplevel_page_' . self::MENU_SLUG) {
            return;
        }
        $manifest = self::manifest();
        if (!$manifest) {
            return;
        }
        $entry = null;
        foreach ($manifest as $item) {
            if (!empty($item['isEntry'])) {
                $entry = $item;
                break;
            }
        }
        if (!$entry) {
            return;
        }

        wp_enqueue_style('knokspack-fonts', 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap', array(), null);
        foreach ((array) ($entry['css'] ?? array()) as $i => $css) {
            wp_enqueue_style('knokspack-app-' . $i, KNOKSPACK_URL . 'dist/' . $css, array(), null);
        }
        // Hashed file names already bust caches, so no version query string.
        wp_enqueue_script('knokspack-app', KNOKSPACK_URL . 'dist/' . $entry['file'], array(), null, true);

        $user = wp_get_current_user();
        wp_localize_script('knokspack-app', 'knokspackData', array(
            'ajaxUrl'      => admin_url('admin-ajax.php'),
            'restUrl'      => esc_url_raw(rest_url('knokspack/v1/')),
            'nonce'        => wp_create_nonce('wp_rest'),
            'pluginUrl'    => KNOKSPACK_URL,
            'version'      => KNOKSPACK_VERSION,
            'aiConfigured' => Knokspack_AI::is_configured(),
            'settingsUrl'  => admin_url('admin.php?page=' . self::SETTINGS_SLUG),
            'user'         => array(
                'id'    => (int) $user->ID,
                'name'  => $user->display_name,
                'email' => $user->user_email,
            ),
        ));
    }

    /** Vite outputs ES modules; load the app with type="module". */
    public function module_type($tag, $handle, $src) {
        if ($handle !== 'knokspack-app') {
            return $tag;
        }
        return sprintf('<script type="module" src="%s" id="knokspack-app-js"></script>' . "\n", esc_url($src));
    }

    public function render_app() {
        if (!current_user_can('manage_options')) {
            return;
        }
        if (!self::manifest()) {
            echo '<div class="wrap"><h1>Knokspack</h1><div class="notice notice-error"><p>';
            esc_html_e('The admin app has not been built. Install the release ZIP, or run "npm ci && npm run build" in the plugin folder.', 'knokspack');
            echo '</p></div></div>';
            return;
        }
        echo '<div id="knokspack-root"></div>';
    }

    public function register_settings() {
        register_setting('knokspack_settings', Knokspack_AI::OPTION, array(
            'type'              => 'array',
            'sanitize_callback' => array($this, 'sanitize_ai'),
            'default'           => array(),
        ));
        register_setting('knokspack_settings', 'knokspack_performance_settings', array(
            'type'              => 'array',
            'sanitize_callback' => array($this, 'sanitize_performance'),
        ));
        register_setting('knokspack_settings', 'knokspack_security_settings', array(
            'type'              => 'array',
            'sanitize_callback' => array($this, 'sanitize_security'),
        ));
    }

    public function sanitize_ai($input) {
        $old = get_option(Knokspack_AI::OPTION, array());
        $out = array(
            'provider' => in_array($input['provider'] ?? '', array('gemini', 'openai'), true) ? $input['provider'] : 'gemini',
            'model'    => sanitize_text_field($input['model'] ?? ''),
            'base_url' => esc_url_raw($input['base_url'] ?? ''),
            'api_key'  => $old['api_key'] ?? '',
        );
        // An empty key field keeps the saved key; "clear" removes it.
        $key = trim((string) ($input['api_key'] ?? ''));
        if ($key === 'clear') {
            $out['api_key'] = '';
        } elseif ($key !== '') {
            $out['api_key'] = sanitize_text_field($key);
        }
        return $out;
    }

    public function sanitize_performance($input) {
        $bools = array('enable_cache', 'enable_lazy_load', 'defer_js', 'enable_cdn');
        $out = Knokspack_Settings_Defaults::performance();
        foreach ($bools as $b) {
            $out[$b] = !empty($input[$b]);
        }
        $out['cdn_url'] = esc_url_raw($input['cdn_url'] ?? '');
        $out['cache_expiry'] = max(60, (int) ($input['cache_expiry'] ?? 3600));
        return $out;
    }

    public function sanitize_security($input) {
        $out = Knokspack_Settings_Defaults::security();
        foreach (array('firewall_enabled', 'brute_force_protection', 'email_notifications', 'trust_proxy_headers') as $b) {
            $out[$b] = !empty($input[$b]);
        }
        $out['max_login_attempts'] = max(3, (int) ($input['max_login_attempts'] ?? 5));
        $out['lockout_duration'] = max(60, (int) ($input['lockout_duration'] ?? 1800));
        return $out;
    }

    public function render_settings() {
        if (!current_user_can('manage_options')) {
            return;
        }
        $ai   = wp_parse_args(get_option(Knokspack_AI::OPTION, array()), array('provider' => 'gemini', 'model' => '', 'base_url' => '', 'api_key' => ''));
        $perf = wp_parse_args(get_option('knokspack_performance_settings', array()), Knokspack_Settings_Defaults::performance());
        $sec  = wp_parse_args(get_option('knokspack_security_settings', array()), Knokspack_Settings_Defaults::security());
        $has_key = $ai['api_key'] !== '';
        ?>
        <div class="wrap">
            <h1><?php esc_html_e('Knokspack Settings', 'knokspack'); ?></h1>
            <?php settings_errors(); ?>
            <form method="post" action="options.php">
                <?php settings_fields('knokspack_settings'); ?>

                <h2><?php esc_html_e('AI writing assistant', 'knokspack'); ?></h2>
                <p><?php esc_html_e('The key is stored in this site\'s database and used only by the server. It is never sent to the browser.', 'knokspack'); ?></p>
                <table class="form-table" role="presentation">
                    <tr>
                        <th scope="row"><label for="kp-provider"><?php esc_html_e('Provider', 'knokspack'); ?></label></th>
                        <td>
                            <select id="kp-provider" name="<?php echo esc_attr(Knokspack_AI::OPTION); ?>[provider]">
                                <option value="gemini" <?php selected($ai['provider'], 'gemini'); ?>>Google Gemini</option>
                                <option value="openai" <?php selected($ai['provider'], 'openai'); ?>><?php esc_html_e('OpenAI-compatible (OpenAI, Jarlhalla AI server, Ollama…)', 'knokspack'); ?></option>
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><label for="kp-model"><?php esc_html_e('Model', 'knokspack'); ?></label></th>
                        <td><input id="kp-model" class="regular-text" name="<?php echo esc_attr(Knokspack_AI::OPTION); ?>[model]" value="<?php echo esc_attr($ai['model']); ?>" placeholder="<?php echo esc_attr(Knokspack_AI::DEFAULT_GEMINI_MODEL); ?>"></td>
                    </tr>
                    <tr>
                        <th scope="row"><label for="kp-base"><?php esc_html_e('Base URL (OpenAI-compatible only)', 'knokspack'); ?></label></th>
                        <td><input id="kp-base" class="regular-text" name="<?php echo esc_attr(Knokspack_AI::OPTION); ?>[base_url]" value="<?php echo esc_attr($ai['base_url']); ?>" placeholder="https://api.openai.com/v1"></td>
                    </tr>
                    <tr>
                        <th scope="row"><label for="kp-key"><?php esc_html_e('API key', 'knokspack'); ?></label></th>
                        <td>
                            <input id="kp-key" type="password" autocomplete="off" class="regular-text" name="<?php echo esc_attr(Knokspack_AI::OPTION); ?>[api_key]" value="" placeholder="<?php echo $has_key ? esc_attr__('Saved — leave empty to keep', 'knokspack') : ''; ?>">
                            <p class="description"><?php esc_html_e('Type "clear" to remove the saved key.', 'knokspack'); ?></p>
                        </td>
                    </tr>
                </table>

                <h2><?php esc_html_e('Performance', 'knokspack'); ?></h2>
                <table class="form-table" role="presentation">
                    <?php $this->checkbox('knokspack_performance_settings', 'enable_lazy_load', $perf, __('Lazy-load images', 'knokspack')); ?>
                    <?php $this->checkbox('knokspack_performance_settings', 'defer_js', $perf, __('Defer front-end scripts (skips jQuery and scripts with inline code)', 'knokspack')); ?>
                    <?php $this->checkbox('knokspack_performance_settings', 'enable_cache', $perf, __('Page cache for visitors who are not logged in', 'knokspack')); ?>
                    <?php $this->checkbox('knokspack_performance_settings', 'enable_cdn', $perf, __('Serve media from a CDN', 'knokspack')); ?>
                    <tr><th scope="row"><?php esc_html_e('CDN URL', 'knokspack'); ?></th><td><input class="regular-text" name="knokspack_performance_settings[cdn_url]" value="<?php echo esc_attr($perf['cdn_url']); ?>"></td></tr>
                    <tr><th scope="row"><?php esc_html_e('Cache lifetime (seconds)', 'knokspack'); ?></th><td><input type="number" min="60" name="knokspack_performance_settings[cache_expiry]" value="<?php echo esc_attr((string) $perf['cache_expiry']); ?>"></td></tr>
                </table>

                <h2><?php esc_html_e('Security', 'knokspack'); ?></h2>
                <table class="form-table" role="presentation">
                    <?php $this->checkbox('knokspack_security_settings', 'firewall_enabled', $sec, __('Basic firewall (blocks common injection patterns)', 'knokspack')); ?>
                    <?php $this->checkbox('knokspack_security_settings', 'brute_force_protection', $sec, __('Lock out IPs after repeated failed logins', 'knokspack')); ?>
                    <?php $this->checkbox('knokspack_security_settings', 'email_notifications', $sec, __('Email the admin on lockouts', 'knokspack')); ?>
                    <?php $this->checkbox('knokspack_security_settings', 'trust_proxy_headers', $sec, __('Site is behind a trusted proxy/CDN (use X-Forwarded-For)', 'knokspack')); ?>
                    <tr><th scope="row"><?php esc_html_e('Failed logins before lockout', 'knokspack'); ?></th><td><input type="number" min="3" name="knokspack_security_settings[max_login_attempts]" value="<?php echo esc_attr((string) $sec['max_login_attempts']); ?>"></td></tr>
                    <tr><th scope="row"><?php esc_html_e('Lockout length (seconds)', 'knokspack'); ?></th><td><input type="number" min="60" name="knokspack_security_settings[lockout_duration]" value="<?php echo esc_attr((string) $sec['lockout_duration']); ?>"></td></tr>
                </table>
                <?php submit_button(); ?>
            </form>
        </div>
        <?php
    }

    private function checkbox($option, $key, $values, $label) {
        printf(
            '<tr><th scope="row">%1$s</th><td><label><input type="checkbox" name="%2$s[%3$s]" value="1" %4$s> %1$s</label></td></tr>',
            esc_html($label),
            esc_attr($option),
            esc_attr($key),
            checked(!empty($values[$key]), true, false)
        );
    }
}

/** Single source of defaults so modules and the settings page agree. */
class Knokspack_Settings_Defaults {
    public static function performance() {
        return array(
            'enable_cache'     => false, // opt-in: a page cache can serve stale pages
            'enable_cdn'       => false,
            'enable_lazy_load' => true,
            'defer_js'         => false, // opt-in: deferring can break themes
            'cdn_url'          => '',
            'cache_expiry'     => 3600,
        );
    }

    public static function security() {
        return array(
            'firewall_enabled'       => true,
            'brute_force_protection' => true,
            'max_login_attempts'     => 5,
            'lockout_duration'       => 1800,
            'scan_frequency'         => 'daily',
            'scan_directories'       => array('plugins', 'themes', 'uploads'),
            'email_notifications'    => true,
            'trust_proxy_headers'    => false,
        );
    }
}
