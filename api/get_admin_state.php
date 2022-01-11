<?php
// Required headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Files needed to use objects
require(dirname(__FILE__) . '/objects/admin.php');
require(dirname(__FILE__) . '/objects/log.php');

// Create variables
$admin = new Admin();
$log = new Log();

// Log use
$log->log_activity('get_admin_state.php', 'unknown', 'Retrieved Wrapperr admin state.');

// Create JSON from functions
$functions_json = array("wrapperr_admin_configured" => $admin->is_configured(),
						"error" => false,
						"message" => "Admin configuration state retrieved."
						);

// Encode JSON and print it
echo json_encode($functions_json);
exit(0);
?>