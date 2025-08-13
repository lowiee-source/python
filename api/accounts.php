<?php
require_once __DIR__ . '/bootstrap.php';
$action = $_GET['action'] ?? ($_POST['action'] ?? 'list');

if ($action === 'create') { json_response(['ok'=>true]); }
if ($action === 'update') { json_response(['ok'=>true]); }
if ($action === 'delete') { json_response(['ok'=>true]); }

$data = [
  [ 'id'=>1,'username'=>'admin','name'=>'Administrator','role'=>'Admin','status'=>'Active','lastLogin'=>date('Y-m-d H:i:s'),'createdAt'=>'2024-01-01 00:00:00','passwordMasked'=>'••••••' ],
  [ 'id'=>2,'username'=>'user','name'=>'Standard User','role'=>'User','status'=>'Active','lastLogin'=>date('Y-m-d H:i:s', time()-86400),'createdAt'=>'2024-02-01 00:00:00','passwordMasked'=>'••••••' ],
];
json_response($data);