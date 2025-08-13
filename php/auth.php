<?php
require __DIR__ . '/utils.php';
$pdo = db();
$payload = json_decode(file_get_contents('php://input'), true) ?: [];
$action = $payload['action'] ?? ($_POST['action'] ?? '');
if ($action === 'login') {
  $u = $payload['username'] ?? '';
  $p = $payload['password'] ?? '';
  if ($pdo) {
    try {
      $stmt = $pdo->prepare("SELECT id, username, name, role FROM accounts WHERE username=? AND password=SHA2(?,256) AND status='Active' LIMIT 1");
      $stmt->execute([$u, $p]);
      $row = $stmt->fetch(PDO::FETCH_ASSOC);
      if ($row) { json_out(['ok'=>true,'user'=>$row]); }
      else json_out(['ok'=>false,'error'=>'Invalid credentials'], 401);
    } catch (Throwable $e) { json_out(['ok'=>false,'error'=>$e->getMessage()], 500); }
  }
  // demo fallback
  if (($u==='admin' && $p==='admin') || ($u==='user' && $p==='user')) {
    $role = $u==='admin' ? 'Admin' : 'User';
    json_out(['ok'=>true,'user'=>['username'=>$u,'name'=>ucfirst($u),'role'=>$role]]);
  }
  json_out(['ok'=>false,'error'=>'Invalid credentials'], 401);
}
if ($action === 'logout') { json_out(['ok'=>true]); }
json_out(['ok'=>false,'error'=>'Unsupported'], 405);