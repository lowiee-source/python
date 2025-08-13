<?php
require_once __DIR__ . '/bootstrap.php';
$input = json_decode(file_get_contents('php://input'), true);
if (!$input) $input = $_POST;
$user = trim($input['username'] ?? '');
$pass = (string)($input['password'] ?? '');
if (!$user || !$pass) json_response(['message' => 'Missing credentials'], 400);

// Placeholder auth; integrate with your existing auth backend
if ($user === 'admin' && $pass === 'admin') json_response(['id'=>1,'username'=>'admin','role'=>'Admin','name'=>'Administrator']);
if ($user === 'user' && $pass === 'user') json_response(['id'=>2,'username'=>'user','role'=>'User','name'=>'Standard User']);
json_response(['message'=>'Invalid credentials'], 401);