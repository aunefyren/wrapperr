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
if(empty($data) || !isset($data->hash)) {

	// Log use
	$log->log_activity('get_link.php', 'unknown', 'No input provided.');

    echo json_encode(array("error" => true, "message" => "No input provided."));
    exit(0);
	
}

// Check if confgiured
if(!$config->is_configured()) {

	// Log use
	$log->log_activity('get_link.php', 'unknown', 'Plex-Wrapped is not configured.');

    echo json_encode(array("error" => true, "message" => "Plex-Wrapped is not configured.", "password" => false, "data" => array()));
    exit(0);

}

// Check if link creation is allowed
if(!$config->create_share_links) {

	// Log use
	$log->log_activity('get_link.php', 'unknown', 'Plex-Wrapped does not allow link creation in config.');

    echo json_encode(array("error" => true, "message" => "Plex-Wrapped option for link creation not enabled."));
    exit(0);

}

// Remove potential harmfull input and seperate ID from hash
$hash_input = explode('-', htmlspecialchars($data->hash));

if(count($hash_input) !== 2) {

    // Log use
	$log->log_activity('get_link.php', 'unknown', 'Failed to get Wrapped link. Can\'t parse input.');

    echo json_encode(array("error" => true, "message" => "Wrapped link is either wrong or expired."));
    exit(0);

}

$id = $hash_input[0];
$hash = $hash_input[1];

// Get the current date
$now = new DateTime('NOW');

// Create random URL value
$random = md5(rand(0,1000));

$url_hash = $id . '-' . $random;

// Save the content to file
$content = $link->open_link($id);

if(!$content) {

	// Log use
	$log->log_activity('get_link.php', 'unknown', 'Failed to get Wrapped link. File not found.');

    echo json_encode(array("error" => true, "message" => "There was an error fetching this Wrapped page. Could the link have expired?"));
    exit(0);

}

$link_data = json_decode($content);

// Validate hash
if($link_data->url_hash !== $data->hash) {

	// Log use
	$log->log_activity('get_link.php', 'unknown', 'Failed to get Wrapped link. Hash did not match.');

    echo json_encode(array("error" => true, "message" => "There was an error fetching this Wrapped page. Could the link have expired?"));
    exit(0);

}

$now = new DateTime('NOW');
$then = date_create_from_format('Y-m-d', $link_data->date);
$diff = (array) date_diff($now, $then);

if($diff['days'] > 7) {

    // Log use
	$log->log_activity('get_link.php', 'unknown', 'Failed to get Wrapped link for ID: ' . $id . '. It has expired. Deleting file.');

    // Delete expired content
    if(!$link->delete_link($id)) {
        $log->log_activity('get_link.php', 'unknown', 'Failed to delete link for ID: ' . $id . '.');
    }

    echo json_encode(array("error" => true, "message" => "This Wrapped link has expired."));
    exit(0);

}

// Log use
$log->log_activity('get_link.php', 'unknown', 'Retrieved Wrapped link for ID: ' . $id . '.');

// Return URL generated
echo json_encode(array("error" => false, "message" => "Link retrieved.", "data" => $link_data->data));
exit(0);
?>