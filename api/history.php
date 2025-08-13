<?php
require_once __DIR__ . '/bootstrap.php';
$action = $_GET['action'] ?? ($_POST['action'] ?? 'list');

if ($action === 'export') { json_response(['ok' => true]); }

$data = [
    [ 'date' => date('Y-m-d'), 'time' => date('H:i:s'), 'user' => 'admin', 'cmcCode' => 'CMC-001', 'action' => 'Update', 'type' => 'Asset', 'details' => 'Changed RAM 8GB -> 16GB' ],
    [ 'date' => date('Y-m-d'), 'time' => date('H:i:s', time()-7200), 'user' => 'admin', 'cmcCode' => 'CMC-002', 'action' => 'Create', 'type' => 'Asset', 'details' => 'New asset added' ],
];
json_response($data);