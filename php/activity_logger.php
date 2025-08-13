<?php
require __DIR__ . '/utils.php';
$pdo = db();
$payload = json_decode(file_get_contents('php://input'), true) ?: [];
if ($pdo) {
  try {
    $stmt = $pdo->prepare("INSERT INTO activity_logs (timestamp, user, ip, action, status, type, cmc_code, details, session_id) VALUES (NOW(),?,?,?,?,?,?,?,?)");
    $stmt->execute([
      $payload['user'] ?? '',
      $_SERVER['REMOTE_ADDR'] ?? '',
      $payload['action'] ?? '',
      $payload['status'] ?? 'Success',
      $payload['type'] ?? '',
      $payload['cmcCode'] ?? '',
      $payload['details'] ?? '',
      $payload['session'] ?? ''
    ]);
    json_out(['ok'=>true]);
  } catch (Throwable $e) { json_out(['ok'=>false,'error'=>$e->getMessage()], 500); }
}
json_out(['ok'=>true]);