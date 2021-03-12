<?php
$data = json_decode(file_get_contents("php://input"));
$config = json_decode(file_get_contents("../config/config.json"));

if(empty($data)) {
    echo json_encode(array("error" => true, "message" => "No input provided."));
    exit(0);
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
?>