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
if(empty($data) || !isset($data->password) || !isset($data->username)) {
    
	// Log use
	$log->log_activity('get_login_admin_cookie.php', 'unknown', 'Input error from user.');

    echo json_encode(array("error" => true, "message" => "Input error."));
    exit(0);
	
}

// Remove potential harmfull input
$password = htmlspecialchars($data->password);
$username = htmlspecialchars($data->username);

// Get Plex token
$admin_cookie = $admin->get_login_admin_cookie($username, $password);

// Validate Plex ID
if(!$admin_cookie) {
    
	// Log use
	$log->log_activity('get_login_admin_cookie.php', 'unknown', 'Admin login not valid.');

    echo json_encode(array("error" => true, "message" => "Login not accepted. Try again."));
    exit(0);
	
}

// Log use
$log->log_activity('get_login_admin_cookie.php', 'admin', 'Admin login accepted. Returned cookie.');

// Print cookie and exit
echo json_encode(array("error" => false, "message" => "Login is valid. Admin cookie created.", "cookie" => $admin_cookie));
exit(0);
?>