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
if(empty($data) || !isset($data->code) || !isset($data->id)) {
    
	// Log use
	$log->log_activity('get_login_cookie.php', 'unknown', 'Input error from user.');

    echo json_encode(array("error" => true, "message" => "Input error."));
    exit(0);
	
}

// Remove potential harmfull input
$id = htmlspecialchars($data->id);
$code = htmlspecialchars($data->code);

// Get cookie
$cookie = $auth->get_cookie($id, $code);

// Log use
$log->log_activity('get_login_cookie.php', 'unknown', 'Plex-Wrapped login cookie created.');

// Print cookie and exit
echo json_encode(array("error" => false, "message" => "Cookie created.", "cookie" => $cookie));
exit(0);
?>