<?php
/**
 * Plugin Name: MyQugen Auth
 * Description: Simple email authentication for Question Paper Generator
 * Version: 1.0.0
 * Author: Your Name
 */

// Prevent direct file access
if (!defined('ABSPATH')) {
    exit;
}

// Register REST API routes
add_action('rest_api_init', function () {
    // Login endpoint
    register_rest_route('myqugen/v1', '/auth', array(
        'methods'  => 'POST',
        'callback' => 'myqugen_check_email',
        'permission_callback' => '__return_true',
    ));
    
    // Verify token endpoint
    register_rest_route('myqugen/v1', '/verify', array(
        'methods'  => 'POST',
        'callback' => 'myqugen_verify_token',
        'permission_callback' => '__return_true',
    ));
});

/**
 * Check if email exists in WordPress users
 */
function myqugen_check_email($request) {
    $params = $request->get_json_params();
    $email = isset($params['email']) ? sanitize_email($params['email']) : '';

    if (empty($email) || !is_email($email)) {
        return new WP_Error('invalid_email', 'Invalid email address', array('status' => 400));
    }

    $user = get_user_by('email', $email);

    if (!$user) {
        return new WP_Error('user_not_found', 'User not found with this email', array('status' => 404));
    }

    // Generate unique auth token for this device
    $auth_token = wp_hash($user->ID . time() . wp_rand(), 'auth');
    
    // Store token in user meta (this will overwrite previous token - ensuring single device login)
    update_user_meta($user->ID, 'myqugen_auth_token', $auth_token);
    update_user_meta($user->ID, 'myqugen_login_time', current_time('mysql'));

    return new WP_REST_Response(array(
        'success' => true,
        'user_id' => $user->ID,
        'user_display_name' => $user->display_name,
        'auth_token' => $auth_token,
        'message' => 'Email verified successfully'
    ), 200);
}

/**
 * Verify auth token
 */
function myqugen_verify_token($request) {
    $params = $request->get_json_params();
    $token = isset($params['token']) ? $params['token'] : '';
    $email = isset($params['email']) ? sanitize_email($params['email']) : '';
    
    if (empty($token) || empty($email)) {
        return new WP_Error('missing_params', 'Token and email are required', array('status' => 400));
    }
    
    // Get user by email
    $user = get_user_by('email', $email);
    
    if (!$user) {
        return new WP_Error('user_not_found', 'User not found', array('status' => 404));
    }
    
    // Get stored token
    $stored_token = get_user_meta($user->ID, 'myqugen_auth_token', true);
    
    // Verify token matches
    if ($stored_token !== $token) {
        return new WP_Error('invalid_token', 'Invalid or expired token. You may have logged in from another device.', array('status' => 401));
    }
    
    return new WP_REST_Response(array(
        'success' => true,
        'user_id' => $user->ID,
        'user_display_name' => $user->display_name,
        'message' => 'Token verified successfully'
    ), 200);
}