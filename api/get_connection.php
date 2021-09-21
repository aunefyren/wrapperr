<?php
$data = json_decode(file_get_contents("php://input"));
$config = json_decode(file_get_contents("../config/config.json"));

if(empty($data)) {
    echo json_encode(array("error" => true, "message" => "No input provided."));
    exit(0);
}

// Log API request if enabled
if($config->use_logs) {
	if(!log_activity()) {
		echo json_encode(array("message" => "Failed to log event.", "error" => true));
		exit(0);
	}
}

$arrContextOptions= [
    'ssl' => [
        'verify_peer'=> false,
        'verify_peer_name'=> false,
    ],
];

$url = htmlspecialchars($data->url);
$apikey = htmlspecialchars($data->apikey);
$ssl = htmlspecialchars($data->ssl);

$url = $url . '?apikey=' . $apikey . '&cmd=status';
try {
    if($ssl) {
        @$response = json_decode(file_get_contents($url, false, stream_context_create($arrContextOptions)));
    } else {
        @$response = json_decode(file_get_contents($url));
    }

    if(!isset($response)) {
        throw new Exception('Could not reach Tautulli.');
    }
} catch (Exception $e) {
    echo json_encode(array("message" => $e->getMessage(), "error" => true, "data" => array()));
    exit(0);
}

echo json_encode(array("error" => false, "message" => "Tautulli reached.", "data" => $response));
exit(0);

function log_activity() {
	$date = date('Y-m-d H:i:s');
	
	$path = "../config/wrapped.log";
	if(!file_exists($path)) {
		$temp = fopen($path, "w");
		fwrite($temp, 'Plex Wrapped');
		fclose($temp);
	}	
	
	$log_file = fopen($path, 'a');
	fwrite($log_file, PHP_EOL . $date . ' - get_connection.php');   
	
	if(fclose($log_file)) {
		return True;
	}
	
	return False;
}
?>