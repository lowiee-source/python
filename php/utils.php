<?php
// DB utility
function db() {
  static $pdo = null;
  if ($pdo) return $pdo;
  $dsn = getenv('DB_DSN');
  $user = getenv('DB_USER');
  $pass = getenv('DB_PASS');
  if (!$dsn && file_exists(__DIR__ . '/config.php')) {
    require __DIR__ . '/config.php';
    if (defined('DB_DSN')) { $dsn = DB_DSN; $user = DB_USER; $pass = DB_PASS; }
  }
  if (!$dsn) return null; // no DB configured
  try {
    $pdo = new PDO($dsn, $user, $pass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    return $pdo;
  } catch (Throwable $e) { return null; }
}

function json_out($data, $status = 200) {
  http_response_code($status);
  header('Content-Type: application/json');
  echo json_encode($data);
  exit;
}