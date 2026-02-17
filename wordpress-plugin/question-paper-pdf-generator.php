<?php
/**
 * Plugin Name: Question Paper PDF Generator
 * Plugin URI: https://ahsan.ronybormon.com
 * Description: Generate PDF from question paper JSON data
 * Version: 1.0.0
 * Author: Your Name
 * Text Domain: qp-pdf-gen
 * Requires PHP: 7.4
 */

if (!defined('ABSPATH')) {
    exit;
}

define('QP_PDF_VERSION', '1.0.0');
define('QP_PDF_PLUGIN_DIR', plugin_dir_path(__FILE__));

class Question_Paper_PDF_Generator {
    private static $instance = null;
    
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    private function __construct() {
        $this->load_dependencies();
        $this->init_hooks();
    }
    
    private function load_dependencies() {
        require_once QP_PDF_PLUGIN_DIR . 'includes/class-qp-post-type.php';
        require_once QP_PDF_PLUGIN_DIR . 'includes/class-qp-rest-api.php';
    }
    
    private function init_hooks() {
        register_activation_hook(__FILE__, array($this, 'activate'));
        add_action('init', array($this, 'init_components'));
        add_action('rest_api_init', array($this, 'add_cors_headers'));
    }
    
    public function init_components() {
        QP_Post_Type::get_instance();
        QP_REST_API::get_instance();
    }
    
    public function add_cors_headers() {
        header("Access-Control-Allow-Origin: *");
        header("Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE");
        header("Access-Control-Allow-Headers: Content-Type, Authorization");
    }
    
    public function activate() {
        flush_rewrite_rules();
    }
}

function qp_pdf_generator() {
    return Question_Paper_PDF_Generator::get_instance();
}

qp_pdf_generator();
