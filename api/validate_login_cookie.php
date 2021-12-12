<?php
// Required headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Files needed to use objects
require(dirname(__FILE__) . '/objects/auth.php');
require(dirname(__FILE__) . '/objects/log.php');

// Create variables
$auth = new Auth();
$log = new Log();
$data = json_decode(file_get_contents("php://input"));

// If POST data is empty or wrong
if(empty($data) || !isset($data->cookie)) {
    
	// Log use
	$log->log_activity('validate_login_cookie.php', 'unknown', 'Input error from user.');

    echo json_encode(array("error" => true, "message" => "Input error."));
    exit(0);
	
}

// Remove potential harmfull input
$cookie = htmlspecialchars($data->cookie);

// Get Plex token
$token_object = json_decode($auth->validate_token($cookie));

// Validate Plex ID
if(empty($token_object) || !isset($token_object->data->id)) {
    
	// Log use
	$log->log_activity('validate_login_cookie.php', 'unknown', 'Plex Token from cookie not valid.');

    echo json_encode(array("error" => true, "message" => "Login not accepted. Log in again."));
    exit(0);
	
}

// Log use
$log->log_activity('validate_login_cookie.php', $token_object->data->id, 'Plex-Wrapped login cookie accepted.');

// Print cookie and exit
echo json_encode(array("error" => false, "message" => "Cookie is valid."));
exit(0);
?>