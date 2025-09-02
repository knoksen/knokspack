<?php
if (!defined('ABSPATH')) exit;

class Knokspack_Stats_Admin {
    private $options;

    public function __construct() {
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_init', array($this, 'init_settings'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_scripts'));
    }

    public function add_admin_menu() {
        add_submenu_page(
            'knokspack-dashboard',
            __('Analytics & Stats', 'knokspack'),
            __('Analytics & Stats', 'knokspack'),
            'manage_options',
            'knokspack-stats',
            array($this, 'render_admin_page')
        );
    }

    public function init_settings() {
        register_setting('knokspack_stats', 'knokspack_stats_settings');

        add_settings_section(
            'knokspack_stats_section',
            __('Stats Settings', 'knokspack'),
            array($this, 'render_section_info'),
            'knokspack-stats'
        );

        add_settings_field(
            'enable_tracking',
            __('Enable Tracking', 'knokspack'),
            array($this, 'render_enable_tracking_field'),
            'knokspack-stats',
            'knokspack_stats_section'
        );

        add_settings_field(
            'track_visitors',
            __('Track Unique Visitors', 'knokspack'),
            array($this, 'render_track_visitors_field'),
            'knokspack-stats',
            'knokspack_stats_section'
        );

        add_settings_field(
            'track_page_views',
            __('Track Page Views', 'knokspack'),
            array($this, 'render_track_page_views_field'),
            'knokspack-stats',
            'knokspack_stats_section'
        );

        add_settings_field(
            'track_events',
            __('Track Events', 'knokspack'),
            array($this, 'render_track_events_field'),
            'knokspack-stats',
            'knokspack_stats_section'
        );

        add_settings_field(
            'retention_days',
            __('Data Retention (Days)', 'knokspack'),
            array($this, 'render_retention_days_field'),
            'knokspack-stats',
            'knokspack_stats_section'
        );
    }

    public function render_section_info() {
        echo '<p>' . __('Configure how Knokspack collects and manages analytics data.', 'knokspack') . '</p>';
    }

    public function render_enable_tracking_field() {
        $options = get_option('knokspack_stats_settings');
        ?>
        <label>
            <input type='checkbox' name='knokspack_stats_settings[enable_tracking]'
                <?php checked($options['enable_tracking'], 1); ?> value='1'>
            <?php _e('Enable all tracking features', 'knokspack'); ?>
        </label>
        <?php
    }

    public function render_track_visitors_field() {
        $options = get_option('knokspack_stats_settings');
        ?>
        <label>
            <input type='checkbox' name='knokspack_stats_settings[track_visitors]'
                <?php checked($options['track_visitors'], 1); ?> value='1'>
            <?php _e('Track unique visitors using cookies', 'knokspack'); ?>
        </label>
        <?php
    }

    public function render_track_page_views_field() {
        $options = get_option('knokspack_stats_settings');
        ?>
        <label>
            <input type='checkbox' name='knokspack_stats_settings[track_page_views]'
                <?php checked($options['track_page_views'], 1); ?> value='1'>
            <?php _e('Track page views and visitor paths', 'knokspack'); ?>
        </label>
        <?php
    }

    public function render_track_events_field() {
        $options = get_option('knokspack_stats_settings');
        ?>
        <label>
            <input type='checkbox' name='knokspack_stats_settings[track_events]'
                <?php checked($options['track_events'], 1); ?> value='1'>
            <?php _e('Track custom events and interactions', 'knokspack'); ?>
        </label>
        <?php
    }

    public function render_retention_days_field() {
        $options = get_option('knokspack_stats_settings');
        $retention_days = isset($options['retention_days']) ? absint($options['retention_days']) : 90;
        ?>
        <input type='number' name='knokspack_stats_settings[retention_days]'
            value='<?php echo esc_attr($retention_days); ?>' min='1' max='365' step='1'>
        <p class="description">
            <?php _e('Number of days to keep detailed analytics data. Default is 90 days.', 'knokspack'); ?>
        </p>
        <?php
    }

    public function enqueue_scripts($hook) {
        if ('knokspack_page_knokspack-stats' !== $hook) {
            return;
        }

        wp_enqueue_style('knokspack-admin-css');
        wp_enqueue_script('knokspack-charts', plugins_url('assets/js/charts.js', KNOKSPACK_PLUGIN_FILE), array('jquery'), KNOKSPACK_VERSION, true);
        wp_localize_script('knokspack-charts', 'knokspackStats', array(
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('knokspack_stats_nonce')
        ));
    }

    public function render_admin_page() {
        if (!current_user_can('manage_options')) {
            return;
        }

        if (isset($_GET['settings-updated'])) {
            add_settings_error(
                'knokspack_messages',
                'knokspack_message',
                __('Settings Saved', 'knokspack'),
                'updated'
            );
        }

        ?>
        <div class="wrap">
            <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
            <?php settings_errors('knokspack_messages'); ?>

            <div class="knokspack-stats-tabs">
                <nav class="nav-tab-wrapper">
                    <a href="#overview" class="nav-tab nav-tab-active"><?php _e('Overview', 'knokspack'); ?></a>
                    <a href="#visitors" class="nav-tab"><?php _e('Visitors', 'knokspack'); ?></a>
                    <a href="#pageviews" class="nav-tab"><?php _e('Page Views', 'knokspack'); ?></a>
                    <a href="#events" class="nav-tab"><?php _e('Events', 'knokspack'); ?></a>
                    <a href="#settings" class="nav-tab"><?php _e('Settings', 'knokspack'); ?></a>
                </nav>

                <div class="tab-content">
                    <div id="overview" class="tab-pane active">
                        <div class="stats-cards">
                            <div class="stats-card">
                                <h3><?php _e('Today\'s Visitors', 'knokspack'); ?></h3>
                                <div class="stats-value" id="today-visitors">-</div>
                            </div>
                            <div class="stats-card">
                                <h3><?php _e('Today\'s Page Views', 'knokspack'); ?></h3>
                                <div class="stats-value" id="today-pageviews">-</div>
                            </div>
                            <div class="stats-card">
                                <h3><?php _e('Active Now', 'knokspack'); ?></h3>
                                <div class="stats-value" id="active-now">-</div>
                            </div>
                        </div>
                        
                        <div class="stats-charts">
                            <div class="stats-chart">
                                <h3><?php _e('Visitors Over Time', 'knokspack'); ?></h3>
                                <div class="chart-container">
                                    <canvas id="visitors-chart"></canvas>
                                </div>
                            </div>
                            <div class="stats-chart">
                                <h3><?php _e('Popular Pages', 'knokspack'); ?></h3>
                                <div class="chart-container">
                                    <canvas id="pages-chart"></canvas>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div id="visitors" class="tab-pane">
                        <div class="stats-filters">
                            <select id="visitor-period">
                                <option value="24hours"><?php _e('Last 24 Hours', 'knokspack'); ?></option>
                                <option value="7days"><?php _e('Last 7 Days', 'knokspack'); ?></option>
                                <option value="30days"><?php _e('Last 30 Days', 'knokspack'); ?></option>
                            </select>
                        </div>
                        <div class="stats-charts">
                            <div class="stats-chart">
                                <h3><?php _e('Visitor Demographics', 'knokspack'); ?></h3>
                                <div class="chart-container">
                                    <canvas id="demographics-chart"></canvas>
                                </div>
                            </div>
                            <div class="stats-chart">
                                <h3><?php _e('Devices & Browsers', 'knokspack'); ?></h3>
                                <div class="chart-container">
                                    <canvas id="devices-chart"></canvas>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div id="pageviews" class="tab-pane">
                        <div class="stats-filters">
                            <select id="pageview-period">
                                <option value="24hours"><?php _e('Last 24 Hours', 'knokspack'); ?></option>
                                <option value="7days"><?php _e('Last 7 Days', 'knokspack'); ?></option>
                                <option value="30days"><?php _e('Last 30 Days', 'knokspack'); ?></option>
                            </select>
                        </div>
                        <div class="stats-charts">
                            <div class="stats-chart">
                                <h3><?php _e('Page Views Over Time', 'knokspack'); ?></h3>
                                <div class="chart-container">
                                    <canvas id="pageviews-chart"></canvas>
                                </div>
                            </div>
                            <div class="stats-table">
                                <h3><?php _e('Most Viewed Pages', 'knokspack'); ?></h3>
                                <table class="wp-list-table widefat fixed striped">
                                    <thead>
                                        <tr>
                                            <th><?php _e('Page', 'knokspack'); ?></th>
                                            <th><?php _e('Views', 'knokspack'); ?></th>
                                            <th><?php _e('Avg. Time', 'knokspack'); ?></th>
                                        </tr>
                                    </thead>
                                    <tbody id="popular-pages">
                                        <tr>
                                            <td colspan="3"><?php _e('Loading...', 'knokspack'); ?></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div id="events" class="tab-pane">
                        <div class="stats-filters">
                            <select id="event-period">
                                <option value="24hours"><?php _e('Last 24 Hours', 'knokspack'); ?></option>
                                <option value="7days"><?php _e('Last 7 Days', 'knokspack'); ?></option>
                                <option value="30days"><?php _e('Last 30 Days', 'knokspack'); ?></option>
                            </select>
                        </div>
                        <div class="stats-charts">
                            <div class="stats-chart">
                                <h3><?php _e('Event Types', 'knokspack'); ?></h3>
                                <div class="chart-container">
                                    <canvas id="events-chart"></canvas>
                                </div>
                            </div>
                            <div class="stats-table">
                                <h3><?php _e('Recent Events', 'knokspack'); ?></h3>
                                <table class="wp-list-table widefat fixed striped">
                                    <thead>
                                        <tr>
                                            <th><?php _e('Event', 'knokspack'); ?></th>
                                            <th><?php _e('Type', 'knokspack'); ?></th>
                                            <th><?php _e('Time', 'knokspack'); ?></th>
                                        </tr>
                                    </thead>
                                    <tbody id="recent-events">
                                        <tr>
                                            <td colspan="3"><?php _e('Loading...', 'knokspack'); ?></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div id="settings" class="tab-pane">
                        <form action="options.php" method="post">
                            <?php
                            settings_fields('knokspack_stats');
                            do_settings_sections('knokspack-stats');
                            submit_button(__('Save Settings', 'knokspack'));
                            ?>
                        </form>
                    </div>
                </div>
            </div>
        </div>
        <?php
    }
}

new Knokspack_Stats_Admin();
