<?php
// Required headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Files needed to use objects
require(dirname(__FILE__) . '/objects/log.php');
require(dirname(__FILE__) . '/objects/admin.php');

// Create variables
$admin = new Admin();
$log = new Log();
$data = json_decode(file_get_contents("php://input"));

// If POST data is empty
if(empty($data) || !isset($data->password) || !isset($data->username)) {

	// Log use
	$log->log_activity('create_admin.php', 'unknown', 'No input provided.');

    echo json_encode(array("error" => true, "message" => "No input provided."));
    exit(0);
	
}

// Remove potential harmfull input
$password = htmlspecialchars($data->password);
$username = htmlspecialchars($data->username);

// Check if confgiured
if($admin->is_configured()) {

	// Log use
	$log->log_activity('create_admin.php', 'unknown', 'Wrapperr admin is already configured.');

    echo json_encode(array("error" => true, "message" => "Wrapperr admin is already configured."));
    exit(0);

// VSave new admin
} else if($admin->create_admin($username, $password)) {
	
	// Log use
	$log->log_activity('create_admin.php', 'unknown', 'Created admin account: ' . $username . ".");

    echo json_encode(array("error" => false, "message" => "Admin account created."));
    exit(0);

// If creating failed
} else {

	// Log use
	$log->log_activity('create_admin.php', 'unknown', 'Failed to create Wrapperr admin.');

    echo json_encode(array("error" => true, "message" => "Failed to create Wrapperr admin."));
    exit(0);

}
?>