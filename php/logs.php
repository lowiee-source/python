<?php
require __DIR__ . '/utils.php';
$pdo = db();
$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'GET') {
  if ($pdo) {
    try {
      $rows = $pdo->query("SELECT id, timestamp, user, ip, action, status, type, cmc_code AS cmcCode, details, session_id AS session FROM activity_logs ORDER BY timestamp DESC LIMIT 500")->fetchAll(PDO::FETCH_ASSOC);
      json_out(['ok'=>true,'items'=>$rows]);
    } catch (Throwable $e) { json_out(['ok'=>false,'error'=>$e->getMessage()], 500); }
  }
  json_out(['ok'=>true,'items'=>[]]);
}
if ($method === 'POST') {
  $payload = json_decode(file_get_contents('php://input'), true) ?: [];
  if (($payload['action'] ?? '') === 'clear') {
    if ($pdo) {
      try { $pdo->exec("DELETE FROM activity_logs WHERE timestamp < NOW() - INTERVAL 90 DAY"); } catch (Throwable $e) { /* ignore */ }
    }
    json_out(['ok'=>true]);
  }
  json_out(['ok'=>false,'error'=>'Unsupported'],405);
}
json_out(['ok'=>false,'error'=>'Method not allowed'],405);