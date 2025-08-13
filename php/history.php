<?php
require __DIR__ . '/utils.php';
$pdo = db();
if ($pdo) {
  try {
    $rows = $pdo->query("SELECT id, DATE(date_time) AS date, TIME(date_time) AS time, user, cmc_code AS cmcCode, action, type, details FROM history ORDER BY date_time DESC LIMIT 500")->fetchAll(PDO::FETCH_ASSOC);
    json_out(['ok'=>true,'items'=>$rows]);
  } catch (Throwable $e) {
    // fallback to activity_logs if history not available
    try {
      $rows = $pdo->query("SELECT id, DATE(timestamp) AS date, TIME(timestamp) AS time, user, cmc_code AS cmcCode, action, type, details FROM activity_logs ORDER BY timestamp DESC LIMIT 500")->fetchAll(PDO::FETCH_ASSOC);
      json_out(['ok'=>true,'items'=>$rows]);
    } catch (Throwable $e2) { json_out(['ok'=>false,'error'=>$e2->getMessage()], 500); }
  }
}
json_out(['ok'=>true,'items'=>[]]);