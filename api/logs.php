<?php
require_once __DIR__ . '/bootstrap.php';
$action = $_GET['action'] ?? ($_POST['action'] ?? 'list');

if ($action === 'clear') { json_response(['ok' => true]); }
if ($action === 'export') { json_response(['ok' => true]); }

$data = [
    [ 'datetime' => date('Y-m-d H:i:s'), 'date' => date('Y-m-d'), 'time' => date('H:i:s'), 'user' => 'admin', 'ip' => '127.0.0.1', 'action' => 'Login', 'type' => 'Authentication', 'status' => 'Success', 'details' => 'User logged in', 'cmcCode' => '', 'session' => 'abcd1234' ],
    [ 'datetime' => date('Y-m-d H:i:s', time()-3600), 'date' => date('Y-m-d', time()-3600), 'time' => date('H:i:s', time()-3600), 'user' => 'admin', 'ip' => '127.0.0.1', 'action' => 'Update', 'type' => 'Asset', 'status' => 'Success', 'details' => 'Updated asset RAM', 'cmcCode' => 'CMC-001', 'session' => 'abcd1234' ],
];
json_response($data);