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
	$log->log_activity('set_config.php', 'unknown', 'No admin login input provided.');

    echo json_encode(array("error" => true, "message" => "No input provided."));
    exit(0);
}

// Remove potential harmfull input
$password = htmlspecialchars($data->password);
$username = htmlspecialchars($data->username);

// Verify password and username combination
if(!$config->is_configured()) {

    // Log use
	$log->log_activity('set_config.php', 'unknown', 'Not configured before, saving first-time configuration.');

    // Call save function
    save_config($data->data, $data->clear_cache);
    
} else if($config->verify_wrapped_admin($username, $password)) {
	
	// Log use
	$log->log_activity('set_config.php', 'unknown', 'Admin login verified.');

    // Call save function
    save_config($data->data, $data->clear_cache);

// If input was given, but is empty
} else {

	// Log use
	$log->log_activity('set_config.php', 'unknown', 'Wrong admin password/username combination.');

    echo json_encode(array("error" => true, "message" => "Username and password combination not accepted.", "password" => true, "data" => array()));
    exit(0);

}

// Retrieve data and save it
function save_config($data, $clear_cache) {

    global $config;
    global $log;

    // Call function to save data
    if($config->save_config($data, $clear_cache)) {

        // Log use
	    $log->log_activity('set_config.php', 'unknown', 'New config was saved.');

        echo json_encode(array("error" => false, "message" => "Changes saved."));
        exit(0);

    } else {

        // Log use
	    $log->log_activity('set_config.php', 'unknown', 'New login was not saved.');

        echo json_encode(array("error" => true, "message" => "Changes were not saved. Is the directory 'config' writable?"));
        exit(0);
    }
}
?>