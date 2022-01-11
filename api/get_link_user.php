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
if(empty($data) || !isset($data->cookie)) {

	// Log use
	$log->log_activity('get_link_user.php', 'unknown', 'No input provided.');

    echo json_encode(array("error" => true, "message" => "No input provided."));
    exit(0);
	
}

// Check if confgiured
if(!$config->is_configured()) {

	// Log use
	$log->log_activity('get_link_user.php', 'unknown', 'Wrapperr is not configured. Can\'t retrieve links.');

    echo json_encode(array("error" => true, "message" => "Wrapperr is not configured.", "password" => false, "data" => array()));
    exit(0);

}

// Check if link creation is allowed
if(!$config->create_share_links) {

	// Log use
	$log->log_activity('get_link_user.php', 'unknown', 'Wrapperr does not allow link creation in config. Will not retrieve link.');

    echo json_encode(array("error" => true, "message" => "Wrapperr option for link creation not enabled."));
    exit(0);

}

// Remove potential harmfull input
$cookie = htmlspecialchars($data->cookie);

// Get the current date
$now = new DateTime('NOW');

// Get Plex Token
$token_object = json_decode($auth->validate_token($cookie));

// Validate Plex ID
if(empty($token_object) || !isset($token_object->data->id)) {
    
	// Log use
	$log->log_activity('get_link_user.php', 'unknown', 'Plex Token from cookie not valid. Could not retrieve link.');

    echo json_encode(array("error" => true, "message" => "Login not accepted. Try again."));
    exit(0);
	
}

// Assign values from Plex Token
$id = $token_object->data->id;

// Save the content to file
$content = $link->open_link($id);

if(!$content) {

	// Log use
	$log->log_activity('get_link_user.php', $id, 'User does not have any Wrapperr link file.');

    echo json_encode(array("error" => false, "message" => "Wrapperr links retrieved.", "links" => array()));
    exit(0);

}

$link_data = json_decode($content);
$then = date_create_from_format('Y-m-d', $link_data->date);
$diff = (array) date_diff($now, $then);

if($diff['days'] > 7) {

    // Log use
	$log->log_activity('get_link_user.php', $id, 'Wrapperr link has expired. Deleting file.');

    // Delete expired content
    if(!$link->delete_link($id)) {
        $log->log_activity('get_link_user.php', $id, 'Failed to delete link.');
    }

    echo json_encode(array("error" => false, "message" => "Wrapperr links retrieved.", "links" => array()));
    exit(0);

}

if($link_data->wrapperr_version !== $config->wrapperr_version) {

    // Log use
	$log->log_activity('get_link_user.php', $id, 'Wrapperr link is made for version: ' . $link_data->wrapperr_version . '. Deleting file.');

    // Delete expired content
    if(!$link->delete_link($id)) {
        $log->log_activity('get_link_user.php', $id, 'Failed to delete link.');
    }

    echo json_encode(array("error" => false, "message" => "Wrapperr links retrieved.", "links" => array()));
    exit(0);

}

// Create link dataset
$links = array('url_hash' => $link_data->url_hash, 'date' => $link_data->date);

// Log use
$log->log_activity('get_link_user.php', $id, 'Retrieved Wrapperr link.');

// Return URL generated
echo json_encode(array("error" => false, "message" => "Wrapperr links retrieved.", "links" => array($links)));
exit(0);
?>