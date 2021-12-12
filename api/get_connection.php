<?php
// Required headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Create variables
$data = json_decode(file_get_contents("php://input"));

// If POST data is empty
if(empty($data)) {

	// Log use
	$log->log_activity('get_config.php', 'unknown', 'No connection input provided.');

    echo json_encode(array("error" => true, "message" => "No input provided."));
    exit(0);
}

// Remove potential harmfull input
$url = htmlspecialchars($data->url);
$apikey = htmlspecialchars($data->apikey);

// Create URL
$url = $url . '?apikey=' . $apikey . '&cmd=status';


// Attempt to call Tautulli API
try {

	// Call Tautulli status API
	//  Initiate curl
	$ch = curl_init();

	// Set the options for curl
	curl_setopt($ch, CURLOPT_URL, $url);
	curl_setopt($ch, CURLOPT_TIMEOUT, 10);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

	// Execute curl
	$result = curl_exec($ch);

	// Check if an error occurred
	if(curl_errno($ch)) {
		echo json_encode(array("error" => true, "message" => "Tautulli did not respond.", "data" => array()));
		exit(0);
	}

	// Closing curl
	curl_close($ch);

	// Decode the JSON response
	$decoded = json_decode($result, true);

	// Check reponse for success
	if($decoded["response"]["result"] == "success") {
		echo json_encode(array("error" => false, "message" => "Tautulli reached and accepted.", "data" => $decoded));
		exit(0);
	}

	// Check reponse for error
	if($decoded["response"]["result"] == "error") {
		$message = $decoded["response"]["message"];
		echo json_encode(array("error" => true, "message" => "Tautulli error. Reply: $message", "data" => $decoded));
		exit(0);
	}

	echo json_encode(array("error" => true, "message" => "Parsing Tautulli reponse failed. It could be working.", "data" => $decoded));
	exit(0);

// Catch errors
} catch (Exception $e) {
    echo json_encode(array("message" => $e->getMessage(), "error" => true, "data" => array()));
    exit(0);
}
?>