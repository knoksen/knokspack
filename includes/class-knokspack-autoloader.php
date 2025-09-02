<?php
/**
 * Class autoloader for Knokspack
 */

if (!defined('ABSPATH')) {
    exit;
}

class Knokspack_Autoloader {
    /**
     * Path to the includes directory
     * @var string
     */
    private $include_path = '';

    /**
     * Class constructor
     */
    public function __construct() {
        if (function_exists('__autoload')) {
            spl_autoload_register('__autoload');
        }

        spl_autoload_register(array($this, 'autoload'));

        $this->include_path = KNOKSPACK_INCLUDES_DIR;
    }

    /**
     * Take a class name and turn it into a file name
     *
     * @param  string $class Class name
     * @return string File name
     */
    private function get_file_name_from_class($class) {
        return 'class-' . str_replace('_', '-', strtolower($class)) . '.php';
    }

    /**
     * Include a class file
     *
     * @param string $path File path
     * @return bool Successful or not
     */
    private function load_file($path) {
        if ($path && is_readable($path)) {
            include_once $path;
            return true;
        }
        return false;
    }

    /**
     * Auto-load Knokspack classes on demand
     *
     * @param string $class Class name
     */
    public function autoload($class) {
        $class = strtolower($class);

        if (0 !== strpos($class, 'knokspack_')) {
            return;
        }

        $file = $this->get_file_name_from_class($class);
        $path = '';

        if (0 === strpos($class, 'knokspack_admin_')) {
            $path = $this->include_path . 'admin/';
        } elseif (0 === strpos($class, 'knokspack_shortcode_')) {
            $path = $this->include_path . 'shortcodes/';
        } elseif (0 === strpos($class, 'knokspack_widget_')) {
            $path = $this->include_path . 'widgets/';
        } elseif (0 === strpos($class, 'knokspack_api_')) {
            $path = $this->include_path . 'api/';
        } else {
            $path = $this->include_path;
        }

        if (!$this->load_file($path . $file)) {
            $this->load_file($this->include_path . $file);
        }
    }
}
