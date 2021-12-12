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

// Log use
$log->log_activity('get_plex_wrapped_version.php', 'unknown', 'Retrieved Plex-Wrapped version.');

// Create JSON from functions
$version_json = array("plex_wrapped_version" => $config->plex_wrapped_version,
						"message" => "Retrieved Plex-Wrapped verison.",
						"error" => false
						);

// Encode JSON and print it
echo json_encode($version_json);
exit(0);
?>