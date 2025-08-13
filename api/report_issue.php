<?php
require_once __DIR__ . '/bootstrap.php';
$input = json_decode(file_get_contents('php://input'), true);
if (!$input) $input = $_POST;
$cmcCode = trim($input['cmcCode'] ?? '');
$department = trim($input['department'] ?? '');
$details = trim($input['details'] ?? '');
if (!$cmcCode || !$department || !$details) {
    json_response(['message' => 'Missing required fields'], 400);
}
// If DB available, you can insert into an issues table or existing logs; here we just acknowledge
json_response(['ok' => true, 'message' => 'Issue recorded']);