<?php
$data = json_decode(file_get_contents("php://input"));

$path = "../config/config.json";
if(!file_exists($path)) {
	fopen($path, "w");
}	
$config = json_decode(file_get_contents("../config/config.json"));

if (empty($config)) {
    echo json_encode(array("message" => "Plex Wrapped is not configured.", "error" => true));
    exit(0);
}

$functions = array("get_user_movie_stats" => $config->get_user_movie_stats,
                    "get_user_show_stats" => $config->get_user_show_stats,
                    "get_user_show_buddy" => $config->get_user_show_buddy,
                    "get_year_stats" => $config->get_year_stats
                    );
echo json_encode($functions);
exit(0);
?>