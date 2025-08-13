<?php
require __DIR__ . '/utils.php';
$pdo = db();
$input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
$cmc = trim($input['cmcCode'] ?? '');
$dept = trim($input['department'] ?? '');
$desc = trim($input['description'] ?? '');
$user = trim($input['user'] ?? 'user');
if ($pdo) {
  try {
    $stmt = $pdo->prepare("INSERT INTO activity_logs (timestamp, user, ip, action, status, type, cmc_code, details, session_id) VALUES (NOW(), ?, ?, 'Report', 'Pending', 'Issue', ?, ?, '')");
    $ip = $_SERVER['REMOTE_ADDR'] ?? '';
    $details = json_encode(['department'=>$dept, 'description'=>$desc], JSON_UNESCAPED_SLASHES|JSON_UNESCAPED_UNICODE);
    $stmt->execute([$user, $ip, $cmc, $details]);
    json_out(['ok'=>true]);
  } catch (Throwable $e) { json_out(['ok'=>false,'error'=>$e->getMessage()], 500); }
}
json_out(['ok'=>true]);