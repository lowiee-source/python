<?php
require_once __DIR__ . '/bootstrap.php';
if (!isset($_FILES['file'])) { json_response(['message' => 'No file'], 400); }
json_response(['ok' => true, 'imported' => 0]);