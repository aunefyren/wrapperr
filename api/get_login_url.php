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
require(dirname(__FILE__) . '/objects/config.php');
$data = json_decode(file_get_contents("php://input"));

// Create variables
$auth = new Auth();
$log = new Log();
$config = new Config();

// Check if configured
if(!$config->is_configured()) {

    // Log activity
    $log->log_activity('get_login_url.php', 'unknown', 'Plex-Wrapped is not confgured..');

    echo json_encode(array("message" => "Plex-Wrapped is not confgured.", "error" => true));
    exit(0);
}

// If POST data is empty or wrong
if(empty($data) || !isset($data->home_url)) {
    
	// Log use
	$log->log_activity('get_login_url.php', 'unknown', 'Input error from user.');

    echo json_encode(array("error" => true, "message" => "Input error."));
    exit(0);
	
}

// Get code and pin from Plex
$pin_object = json_decode($auth->get_pin(), true);

// Get URL using pin and code
$url = $auth->get_login_url($pin_object['code'], $pin_object['id'], $data->home_url);

// Log URL creation
$log->log_activity('get_login_url.php', 'unknown', 'Login URL returned.');

// Return URL for login
echo json_encode(array("message" => 'Plex login URL created.', "error" => false, "url" => $url, "code" => $pin_object['code'], "id" => $pin_object['id']));
exit(0);

?>