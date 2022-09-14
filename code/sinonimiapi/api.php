<?php

include_once 'baza.php';


// Pridobi sinonim iz baze sinonimov 
function getSynonym()
{

    global $conn;

    $geslo = $_GET['geslo'];
    if (!empty($geslo)) {
        $sql = "SELECT sopomenka.naziv, pomen.razlaga FROM geslo INNER JOIN pomen ON geslo.id=pomen.geslo_id  INNER JOIN sopomenka ON sopomenka.pomen_id=pomen.id WHERE geslo.iztocnica='$geslo' AND sopomenka.ime='sopomenka';";
        $records = mysqli_query($conn, $sql);
        $results = [];
        while ($row = mysqli_fetch_assoc($records)) {
            $results[] = $row;
        }
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST');
        header("Access-Control-Allow-Headers: X-Requested-With");
        echo json_encode($results);
    } else {
        http_response_code(400);
        echo "Parameter geslo je obvezen!";
    }
}


$function = explode('/', $_SERVER['REDIRECT_URL'])[2];

if (strlen($function) > 0 && function_exists($function)) {
    call_user_func($function);
}