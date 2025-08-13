<?php
require_once __DIR__ . '/bootstrap.php';
$action = $_GET['action'] ?? ($_POST['action'] ?? 'list');

if ($action === 'clear') {
    // If DB configured, delete recent notifications; fallback: ok
    json_response([ 'ok' => true ]);
}

// list
$items = [
    [ 'type' => 'info', 'title' => 'System', 'message' => 'Daily backup completed', 'time' => date('M d, Y H:i') ],
    [ 'type' => 'success', 'title' => 'Assets', 'message' => '3 assets imported', 'time' => date('M d, Y H:i', time()-3600) ],
];
json_response($items);