<?php
// Required headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Files needed to use objects
require(dirname(__FILE__) . '/objects/admin.php');
require(dirname(__FILE__) . '/objects/log.php');

// Create variables
$admin = new Admin();
$log = new Log();
$data = json_decode(file_get_contents("php://input"));

// If POST data is empty or wrong
if(empty($data) || !isset($data->cookie)) {
    
	// Log use
	$log->log_activity('validate_login_admin_cookie.php', 'unknown', 'Input error from user.');

    echo json_encode(array("error" => true, "message" => "Input error."));
    exit(0);
	
}

// Remove potential harmfull input
$cookie = htmlspecialchars($data->cookie);

// Decrypt cookie
$cookie_object = json_decode($admin->decrypt_cookie($cookie));

// Validate admin cookie
if(!$admin->validate_cookie($cookie_object)) {
    
	// Log use
	$log->log_activity('validate_login_admin_cookie.php', 'unknown', 'Admin cookie not valid.');

    echo json_encode(array("error" => true, "message" => "Admin cookie not accepted. Log in again."));
    exit(0);
	
}

// Log use
$log->log_activity('validate_login_admin_cookie.php', 'admin', 'Admin login cookie accepted.');

// Print cookie and exit
echo json_encode(array("error" => false, "message" => "Cookie is valid."));
exit(0);
?>