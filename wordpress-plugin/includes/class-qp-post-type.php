<?php
if (!defined('ABSPATH')) {
    exit;
}

class QP_Post_Type {
    private static $instance = null;
    
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    private function __construct() {
        add_action('init', array($this, 'register_post_type'));
    }
    
    public function register_post_type() {
        register_post_type('question_paper', array(
            'label' => 'Question Papers',
            'public' => true,
            'show_in_rest' => true,
            'rest_base' => 'papers',
            'rest_controller_class' => 'WP_REST_Posts_Controller',
            'supports' => array('title', 'custom-fields'),
        ));
    }
}
