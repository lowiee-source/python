<?php
require __DIR__ . '/utils.php';
$pdo = db();
if ($pdo) {
  try {
    $total = $pdo->query("SELECT COUNT(*) FROM assets")->fetchColumn();
    $inUse = $pdo->query("SELECT COUNT(*) FROM assets WHERE status='In Use'")->fetchColumn();
    $inStock = $pdo->query("SELECT COUNT(*) FROM assets WHERE status='In Stock'")->fetchColumn();
    $maintenance = $pdo->query("SELECT COUNT(*) FROM assets WHERE status='Maintenance'")->fetchColumn();
    $retired = $pdo->query("SELECT COUNT(*) FROM assets WHERE status='Retired'")->fetchColumn();

    $byDept = $pdo->query("SELECT department AS name, COUNT(*) AS count FROM assets GROUP BY department ORDER BY count DESC LIMIT 10")->fetchAll(PDO::FETCH_ASSOC);
    $byType = $pdo->query("SELECT classification AS name, COUNT(*) AS count FROM assets GROUP BY classification")->fetchAll(PDO::FETCH_ASSOC);
    $byRam = $pdo->query("SELECT ram AS name, COUNT(*) AS count FROM assets GROUP BY ram")->fetchAll(PDO::FETCH_ASSOC);
    $byOs = $pdo->query("SELECT operatingSystem AS name, COUNT(*) AS count FROM assets GROUP BY operatingSystem")->fetchAll(PDO::FETCH_ASSOC);

    json_out([
      'totalAssets' => (int)$total,
      'inUse' => (int)$inUse,
      'inStock' => (int)$inStock,
      'maintenance' => (int)$maintenance,
      'retired' => (int)$retired,
      'byDepartment' => $byDept,
      'byType' => $byType,
      'byRam' => $byRam,
      'byOs' => $byOs,
      'ok' => true,
    ]);
  } catch (Throwable $e) { json_out(['ok'=>false,'error'=>$e->getMessage()], 500); }
}
// fallback
json_out([
  'totalAssets' => 0, 'inUse'=>0, 'inStock'=>0, 'maintenance'=>0, 'retired'=>0,
  'byDepartment'=>[], 'byType'=>[], 'byRam'=>[], 'byOs'=>[], 'ok'=>true
]);