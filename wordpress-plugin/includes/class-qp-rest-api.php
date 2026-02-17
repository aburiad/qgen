<?php
if (!defined('ABSPATH')) {
    exit;
}

class QP_REST_API {
    private static $instance = null;
    
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    private function __construct() {
        add_action('rest_api_init', array($this, 'register_routes'));
    }
    
    public function register_routes() {
        $namespace = 'qpm/v1';
        
        // PAPERS LIST - GET all papers and POST to create
        register_rest_route($namespace, '/papers', array(
            array(
                'methods' => 'GET',
                'callback' => array($this, 'get_papers'),
                'permission_callback' => '__return_true',
            ),
            array(
                'methods' => 'POST',
                'callback' => array($this, 'save_paper'),
                'permission_callback' => '__return_true',
            ),
        ));
        
        // SINGLE PAPER - GET, PUT, DELETE
        register_rest_route($namespace, '/papers/(?P<id>\d+)', array(
            array(
                'methods' => 'GET',
                'callback' => array($this, 'get_paper'),
                'permission_callback' => '__return_true',
                'args' => array(
                    'id' => array(
                        'required' => true,
                        'validate_callback' => function($param) {
                            return is_numeric($param);
                        }
                    ),
                ),
            ),
            array(
                'methods' => 'PUT',
                'callback' => array($this, 'update_paper'),
                'permission_callback' => '__return_true',
                'args' => array(
                    'id' => array(
                        'required' => true,
                        'validate_callback' => function($param) {
                            return is_numeric($param);
                        }
                    ),
                ),
            ),
            array(
                'methods' => 'DELETE',
                'callback' => array($this, 'delete_paper'),
                'permission_callback' => '__return_true',
                'args' => array(
                    'id' => array(
                        'required' => true,
                        'validate_callback' => function($param) {
                            return is_numeric($param);
                        }
                    ),
                ),
            ),
        ));
        
        // DUPLICATE PAPER
        register_rest_route($namespace, '/papers/(?P<id>\d+)/duplicate', array(
            'methods' => 'POST',
            'callback' => array($this, 'duplicate_paper'),
            'permission_callback' => '__return_true',
            'args' => array(
                'id' => array(
                    'required' => true,
                    'validate_callback' => function($param) {
                        return is_numeric($param);
                    }
                ),
            ),
        ));
    }
    
    public function save_paper($request) {
        try {
            $params = $request->get_json_params();
            
            if (empty($params['title'])) {
                return new WP_Error('missing_title', 'Title is required', array('status' => 400));
            }
            
            $post_data = array(
                'post_title' => sanitize_text_field($params['title']),
                'post_type' => 'question_paper',
                'post_status' => 'publish',
                'post_content' => '',
            );
            
            $post_id = wp_insert_post($post_data);
            
            if (is_wp_error($post_id)) {
                return $post_id;
            }
            
            if (!empty($params['data'])) {
                update_post_meta($post_id, 'qp_data', wp_json_encode($params['data']));
            }
            
            if (!empty($params['pageSettings'])) {
                update_post_meta($post_id, 'qp_page_settings', wp_json_encode($params['pageSettings']));
            }
            
            return new WP_REST_Response(array(
                'success' => true,
                'post_id' => $post_id,
                'message' => 'Question paper saved successfully'
            ), 201);
            
        } catch (Exception $e) {
            return new WP_Error('save_failed', $e->getMessage(), array('status' => 500));
        }
    }
    
    public function get_papers($request) {
        $args = array(
            'post_type' => 'question_paper',
            'posts_per_page' => -1,
            'post_status' => 'publish',
            'orderby' => 'date',
            'order' => 'DESC'
        );
        
        $query = new WP_Query($args);
        $papers = array();
        
        if ($query->have_posts()) {
            while ($query->have_posts()) {
                $query->the_post();
                $post_id = get_the_ID();
                
                $paper_data = get_post_meta($post_id, 'qp_data', true);
                $page_settings = get_post_meta($post_id, 'qp_page_settings', true);
                
                // Parse the paper data
                $parsed_data = $paper_data ? json_decode($paper_data, true) : null;
                $parsed_settings = $page_settings ? json_decode($page_settings, true) : null;
                
                // Return the parsed data directly (it contains id, title, setup, questions, etc)
                if ($parsed_data) {
                    // Ensure id is set
                    $parsed_data['id'] = (string)$post_id;
                    $papers[] = $parsed_data;
                } else {
                    // Fallback if no data stored
                    $papers[] = array(
                        'id' => (string)$post_id,
                        'title' => get_the_title(),
                        'createdAt' => get_the_date('c'),
                        'updatedAt' => get_the_modified_date('c'),
                    );
                }
            }
            wp_reset_postdata();
        }
        
        return new WP_REST_Response($papers, 200);
    }
    
    public function get_paper($request) {
        $post_id = $request->get_param('id');
        $post = get_post($post_id);
        
        if (!$post || $post->post_type !== 'question_paper') {
            return new WP_Error('not_found', 'Question paper not found', array('status' => 404));
        }
        
        $paper_data = get_post_meta($post_id, 'qp_data', true);
        $page_settings = get_post_meta($post_id, 'qp_page_settings', true);
        
        // Parse and return the full data object
        $parsed_data = $paper_data ? json_decode($paper_data, true) : null;
        
        if ($parsed_data) {
            $parsed_data['id'] = (string)$post_id;
            return new WP_REST_Response($parsed_data, 200);
        }
        
        return new WP_Error('no_data', 'No data found for this paper', array('status' => 404));
    }
    
    public function update_paper($request) {
        try {
            $post_id = $request->get_param('id');
            $params = $request->get_json_params();
            
            $post = get_post($post_id);
            if (!$post || $post->post_type !== 'question_paper') {
                return new WP_Error('not_found', 'Question paper not found', array('status' => 404));
            }
            
            if (!empty($params['title'])) {
                wp_update_post(array(
                    'ID' => $post_id,
                    'post_title' => sanitize_text_field($params['title'])
                ));
            }
            
            if (!empty($params['data'])) {
                update_post_meta($post_id, 'qp_data', wp_json_encode($params['data']));
            }
            
            if (!empty($params['pageSettings'])) {
                update_post_meta($post_id, 'qp_page_settings', wp_json_encode($params['pageSettings']));
            }
            
            return new WP_REST_Response(array(
                'success' => true,
                'post_id' => $post_id,
                'message' => 'Question paper updated successfully'
            ), 200);
            
        } catch (Exception $e) {
            return new WP_Error('update_failed', $e->getMessage(), array('status' => 500));
        }
    }
    
    public function delete_paper($request) {
        try {
            $post_id = $request->get_param('id');
            $post = get_post($post_id);
            
            if (!$post || $post->post_type !== 'question_paper') {
                return new WP_Error('not_found', 'Question paper not found', array('status' => 404));
            }
            
            wp_delete_post($post_id, true);
            
            return new WP_REST_Response(array(
                'success' => true,
                'message' => 'Question paper deleted successfully'
            ), 200);
            
        } catch (Exception $e) {
            return new WP_Error('delete_failed', $e->getMessage(), array('status' => 500));
        }
    }
    
    public function duplicate_paper($request) {
        try {
            $post_id = $request->get_param('id');
            $post = get_post($post_id);
            
            if (!$post || $post->post_type !== 'question_paper') {
                return new WP_Error('not_found', 'Question paper not found', array('status' => 404));
            }
            
            $original_title = get_the_title($post_id);
            $paper_data = get_post_meta($post_id, 'qp_data', true);
            $page_settings = get_post_meta($post_id, 'qp_page_settings', true);
            
            $new_post_data = array(
                'post_title' => $original_title . ' (Copy)',
                'post_type' => 'question_paper',
                'post_status' => 'publish',
                'post_author' => get_post_field('post_author', $post_id),
            );
            
            $new_post_id = wp_insert_post($new_post_data);
            
            if (is_wp_error($new_post_id)) {
                return $new_post_id;
            }
            
            if ($paper_data) {
                update_post_meta($new_post_id, 'qp_data', $paper_data);
            }
            if ($page_settings) {
                update_post_meta($new_post_id, 'qp_page_settings', $page_settings);
            }
            
            return new WP_REST_Response(array(
                'success' => true,
                'post_id' => $new_post_id,
                'message' => 'Question paper duplicated successfully'
            ), 201);
            
        } catch (Exception $e) {
            return new WP_Error('duplicate_failed', $e->getMessage(), array('status' => 500));
        }
    }
}
