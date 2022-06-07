<?php

$parts = explode('/', $_SERVER['REDIRECT_URL']);

if ($parts[1] == "api") {
    include_once('api.php');
} else {
    http_response_code(404);
    echo "Not Found";
}
