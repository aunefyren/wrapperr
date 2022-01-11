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
if(empty($data) || !isset($data->cookie) || !isset($data->password) || !isset($data->username)) {

	// Log use
	$log->log_activity('set_admin.php', 'unknown', 'No input provided.');

    echo json_encode(array("error" => true, "message" => "No input provided."));
    exit(0);
	
}

// Remove potential harmfull input
$cookie = htmlspecialchars($data->cookie);
$password = $data->password;
$username = $data->username;

// Check if confgiured
if(!$admin->is_configured()) {

	// Log use
	$log->log_activity('set_admin.php', 'unknown', 'Wrapperr admin is not configured. Can\'t update admin configuration.');

    echo json_encode(array("error" => true, "message" => "Wrapperr admin is not configured."));
    exit(0);

}

// Decrypt cookie
$cookie_object = json_decode($admin->decrypt_cookie($cookie));

// Validate admin cookie
if(!$admin->validate_cookie($cookie_object)) {
    
	// Log use
	$log->log_activity('set_admin.php', 'unknown', 'Admin cookie not valid. Can\'t update admin configuration.');

    echo json_encode(array("error" => true, "message" => "Admin cookie not accepted. Log in again."));
    exit(0);
	
}

$admin->username = $username;
$admin->password = password_hash($password, PASSWORD_DEFAULT);

if($admin->save_admin()) {

    // Log use
    $log->log_activity('set_admin.php', 'admin', 'Updated and saved admin configuration.');

    echo json_encode(array("error" => false, "message" => "Admin account updated."));
    exit(0);

} else {

    // Log use
    $log->log_activity('set_admin.php', 'admin', 'Could not save admin configuration. Is the \'config\' directory writable?');

    echo json_encode(array("error" => true, "message" => "Admin account was not updated. Is the \'config\' directory writable?"));
    exit(0);

}
?>