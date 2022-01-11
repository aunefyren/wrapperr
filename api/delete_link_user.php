<?php
// Required headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Files needed to use objects
require(dirname(__FILE__) . '/objects/auth.php');
require(dirname(__FILE__) . '/objects/config.php');
require(dirname(__FILE__) . '/objects/log.php');
require(dirname(__FILE__) . '/objects/link.php');

// Create variables
$auth = new Auth();
$config = new Config();
$link = new Link();
$log = new Log();
$data = json_decode(file_get_contents("php://input"));

// If POST data is empty
if(empty($data) || empty($data->cookie)) {

	// Log use
	$log->log_activity('delete_link_user.php', 'unknown', 'No input provided.');

    echo json_encode(array("error" => true, "message" => "No input provided."));
    exit(0);
	
}

// Check if confgiured
if(!$config->is_configured()) {

	// Log use
	$log->log_activity('delete_link_user.php', 'unknown', 'Wrapperr is not configured. Can\'t delete link.');

    echo json_encode(array("error" => true, "message" => "Wrapperr is not configured.", "password" => false, "data" => array()));
    exit(0);

}

// Check if link creation is allowed
if(!$config->create_share_links) {

	// Log use
	$log->log_activity('delete_link_user.php', 'unknown', 'Wrapperr does not allow link creation in config. Won\'t delete link.');

    echo json_encode(array("error" => true, "message" => "Wrapperr option for link creation not enabled."));
    exit(0);

}

// Remove potential harmfull input
$cookie = htmlspecialchars($data->cookie);

// Get Plex Token
$token_object = json_decode($auth->validate_token($cookie));

// Validate Plex ID
if(empty($token_object) || !isset($token_object->data->id)) {
    
	// Log use
	$log->log_activity('delete_link_user.php', 'unknown', 'Plex Token from cookie not valid. Could not create link.');

    echo json_encode(array("error" => true, "message" => "Login not accepted. Try again."));
    exit(0);
	
}

// Assign values from Plex Token
$id = $token_object->data->id;

// Delete content
if(!$link->delete_link($id)) {

    // Log use
    $log->log_activity('delete_link_user.php', $id, 'Failed to delete link. Not found.');

    echo json_encode(array("error" => true, "message" => "This Wrapperr link has expired."));
    exit(0);

}

// Log use
$log->log_activity('delete_link_user.php', $id, 'Wrapperr link deleted by user.');

echo json_encode(array("error" => false, "message" => "This Wrapperr link deleted."));
exit(0);
?>