<?php
// Pridobi conn podatke iz ENV spremenljivk 
$dbHost = getenv('DB_HOST');
$dbName = getenv('DB_NAME');
$dbUser = getenv('DB_USER');
$dbPass = getenv('DB_PASS');

$conn = new mysqli($dbHost, $dbUser, $dbPass, $dbName);
mysqli_set_charset($conn, "utf8");
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
