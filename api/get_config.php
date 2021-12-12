<?php
// Required headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Files needed to use objects
require(dirname(__FILE__) . '/objects/config.php');
require(dirname(__FILE__) . '/objects/log.php');

// Create variables
$config = new Config();
$log = new Log();
$data = json_decode(file_get_contents("php://input"));

// If POST data is empty
if(empty($data)) {

	// Log use
	$log->log_activity('get_config.php', 'unknown', 'No admin login input provided.');

    echo json_encode(array("error" => true, "message" => "No input provided."));
    exit(0);
	
}

// Remove potential harmfull input
$password = htmlspecialchars($data->password);
$username = htmlspecialchars($data->username);

// Check if confgiured
if(!$config->is_configured()) {

	// Log use
	$log->log_activity('get_config.php', 'unknown', 'Plex-Wrapped is not configured.');

    echo json_encode(array("error" => true, "message" => "Plex-Wrapped is not configured.", "password" => false, "data" => array()));
    exit(0);

// Verify password and username combination
} else if($config->verify_wrapped_admin($username, $password)) {
	
	// Log use
	$log->log_activity('get_config.php', 'unknown', 'Retrieved Plex-Wrapped configuraton.');

    echo json_encode(array("error" => false, "message" => "Login successful.", "password" => true, "data" => $config));
    exit(0);

// If input was given, but is empty
} else {

	// Log use
	$log->log_activity('get_config.php', 'unknown', 'Wrong admin password/username combination.');

    echo json_encode(array("error" => true, "message" => "Username and password combination not accepted.", "password" => true, "data" => array()));
    exit(0);

}
?>