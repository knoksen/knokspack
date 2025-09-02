<?php
if (!defined('ABSPATH')) exit;

class Knokspack_Security {
    private $options;
    private $blocked_ips = array();

    public function __construct() {
        $this->options = get_option('knokspack_security_settings', array(
            'firewall_enabled' => true,
            'brute_force_protection' => true,
            'max_login_attempts' => 5,
            'lockout_duration' => 1800, // 30 minutes
            'scan_frequency' => 'daily',
            'scan_directories' => array('plugins', 'themes', 'uploads'),
            'email_notifications' => true
        ));

        $this->blocked_ips = get_option('knokspack_blocked_ips', array());

        // Initialize security features
        add_action('init', array($this, 'init_security'));
        add_action('wp_login_failed', array($this, 'handle_failed_login'));
        add_action('wp_login', array($this, 'handle_successful_login'), 10, 2);
        add_action('admin_init', array($this, 'schedule_scans'));
        
        // Add AJAX handlers
        add_action('wp_ajax_knokspack_run_security_scan', array($this, 'ajax_run_security_scan'));
        add_action('wp_ajax_knokspack_unblock_ip', array($this, 'ajax_unblock_ip'));
    }

    public function init_security() {
        if ($this->options['firewall_enabled']) {
            $this->check_firewall_rules();
        }

        if ($this->options['brute_force_protection']) {
            $this->check_ip_block();
        }
    }

    public function check_firewall_rules() {
        $rules = array(
            'REQUEST_METHOD' => array('TRACE', 'TRACK', 'OPTIONS'),
            'QUERY_STRING' => array('eval\(', 'UNION.+SELECT', 'base64_', '(\<|%3C).*script.*(\>|%3E)'),
            'REQUEST_URI' => array('wp-config.php', 'wp-admin/install.php', 'wp-admin/setup-config.php'),
            'HTTP_USER_AGENT' => array('libwww-perl', '^$')
        );

        foreach ($rules as $var => $patterns) {
            if (isset($_SERVER[$var])) {
                foreach ($patterns as $pattern) {
                    if (preg_match('#' . $pattern . '#i', $_SERVER[$var])) {
                        $this->log_blocked_request();
                        wp_die('Access Denied', 'Security Alert', array('response' => 403));
                    }
                }
            }
        }
    }

    public function check_ip_block() {
        $ip = $this->get_client_ip();
        if (isset($this->blocked_ips[$ip])) {
            $block = $this->blocked_ips[$ip];
            if ($block['expires'] > time()) {
                wp_die(
                    sprintf(
                        'Access blocked due to too many failed login attempts. Try again after %s minutes.',
                        ceil(($block['expires'] - time()) / 60)
                    ),
                    'Security Alert',
                    array('response' => 403)
                );
            } else {
                unset($this->blocked_ips[$ip]);
                update_option('knokspack_blocked_ips', $this->blocked_ips);
            }
        }
    }

    public function handle_failed_login($username) {
        $ip = $this->get_client_ip();
        
        if (!isset($this->blocked_ips[$ip])) {
            $this->blocked_ips[$ip] = array(
                'attempts' => 1,
                'first_attempt' => time(),
                'expires' => 0
            );
        } else {
            $this->blocked_ips[$ip]['attempts']++;
        }

        if ($this->blocked_ips[$ip]['attempts'] >= $this->options['max_login_attempts']) {
            $this->blocked_ips[$ip]['expires'] = time() + $this->options['lockout_duration'];
            if ($this->options['email_notifications']) {
                $this->send_lockout_notification($ip);
            }
        }

        update_option('wpss_blocked_ips', $this->blocked_ips);
        $this->log_failed_login($username, $ip);
    }

    private function get_client_ip() {
        $ip = '';
        if (isset($_SERVER['HTTP_CLIENT_IP'])) {
            $ip = $_SERVER['HTTP_CLIENT_IP'];
        } elseif (isset($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            $ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
        } elseif (isset($_SERVER['REMOTE_ADDR'])) {
            $ip = $_SERVER['REMOTE_ADDR'];
        }
        return filter_var($ip, FILTER_VALIDATE_IP);
    }

    public function schedule_scans() {
        if (!wp_next_scheduled('knokspack_security_scan')) {
            wp_schedule_event(time(), $this->options['scan_frequency'], 'knokspack_security_scan');
        }
    }

    public function run_security_scan() {
        $results = array(
            'malware' => array(),
            'vulnerabilities' => array(),
            'file_changes' => array()
        );

        foreach ($this->options['scan_directories'] as $dir) {
            $path = WP_CONTENT_DIR . '/' . $dir;
            $this->scan_directory($path, $results);
        }

        update_option('knokspack_last_scan_results', $results);
        update_option('knokspack_last_scan_time', time());

        if (!empty($results['malware']) || !empty($results['vulnerabilities'])) {
            $this->send_scan_notification($results);
        }

        return $results;
    }

    private function scan_directory($dir, &$results) {
        if (!is_dir($dir)) return;

        $files = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($dir, RecursiveDirectoryIterator::SKIP_DOTS)
        );

        foreach ($files as $file) {
            if ($file->isFile()) {
                $this->scan_file($file, $results);
            }
        }
    }

    private function scan_file($file, &$results) {
        $content = file_get_contents($file);
        
        // Check for malware signatures
        $malware_patterns = array(
            'eval\s*\(.*base64_decode\s*\(',
            'shell_exec\s*\(',
            'gzinflate\s*\(\s*base64_decode\s*\(',
            'eval\s*\(\s*\$_POST',
            'eval\s*\(\s*\$_GET',
            'eval\s*\(\s*\$_REQUEST'
        );

        foreach ($malware_patterns as $pattern) {
            if (preg_match('#' . $pattern . '#i', $content)) {
                $results['malware'][] = array(
                    'file' => $file->getPathname(),
                    'pattern' => $pattern
                );
            }
        }

        // Check for file changes (if we have a hash record)
        $file_hashes = get_option('knokspack_file_hashes', array());
        $current_hash = md5_file($file);
        
        if (isset($file_hashes[$file->getPathname()]) && 
            $file_hashes[$file->getPathname()] !== $current_hash) {
            $results['file_changes'][] = $file->getPathname();
        }

        $file_hashes[$file->getPathname()] = $current_hash;
        update_option('knokspack_file_hashes', $file_hashes);
    }

    private function send_scan_notification($results) {
        $admin_email = get_option('admin_email');
        $subject = 'Security Scan Results - ' . get_bloginfo('name');
        
        $message = "Security scan completed with the following findings:\n\n";
        
        if (!empty($results['malware'])) {
            $message .= "Potential Malware Found:\n";
            foreach ($results['malware'] as $malware) {
                $message .= "- {$malware['file']}\n";
            }
        }

        if (!empty($results['vulnerabilities'])) {
            $message .= "\nVulnerabilities Found:\n";
            foreach ($results['vulnerabilities'] as $vuln) {
                $message .= "- {$vuln['description']}\n";
            }
        }

        $message .= "\nPlease review these findings in your WordPress dashboard.";
        
        wp_mail($admin_email, $subject, $message);
    }

    private function send_lockout_notification($ip) {
        $admin_email = get_option('admin_email');
        $subject = 'IP Address Blocked - ' . get_bloginfo('name');
        
        $message = sprintf(
            "IP address %s has been blocked due to too many failed login attempts.\n\n" .
            "Time: %s\n" .
            "Attempts: %d\n" .
            "Duration: %d minutes\n\n" .
            "You can unblock this IP from your WordPress dashboard.",
            $ip,
            date('Y-m-d H:i:s'),
            $this->blocked_ips[$ip]['attempts'],
            $this->options['lockout_duration'] / 60
        );
        
        wp_mail($admin_email, $subject, $message);
    }

    private function log_failed_login($username, $ip) {
        global $wpdb;
        $wpdb->insert(
            $wpdb->prefix . 'knokspack_activity_log',
            array(
                'user_id' => 0,
                'action' => 'failed_login',
                'object_type' => 'user',
                'object_id' => 0,
                'ip_address' => $ip,
                'details' => json_encode(array(
                    'username' => $username,
                    'attempts' => $this->blocked_ips[$ip]['attempts']
                ))
            )
        );
    }

    public function ajax_run_security_scan() {
        check_ajax_referer('knokspack_security_nonce');
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Insufficient permissions');
        }
        $results = $this->run_security_scan();
        wp_send_json_success($results);
    }

    public function ajax_unblock_ip() {
        check_ajax_referer('knokspack_security_nonce');
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Insufficient permissions');
        }
        
        $ip = $_POST['ip'];
        if (isset($this->blocked_ips[$ip])) {
            unset($this->blocked_ips[$ip]);
            update_option('wpss_blocked_ips', $this->blocked_ips);
            wp_send_json_success('IP unblocked successfully');
        } else {
            wp_send_json_error('IP not found in blocked list');
        }
    }
}

// Initialize the security module
new Knokspack_Security();
