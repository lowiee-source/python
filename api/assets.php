<?php
require_once __DIR__ . '/bootstrap.php';
$action = $_GET['action'] ?? ($_POST['action'] ?? 'list');

if ($action === 'create') { json_response(['ok'=>true]); }
if ($action === 'update') { json_response(['ok'=>true]); }
if ($action === 'delete') { json_response(['ok'=>true]); }

$data = [
  [ 'id'=>1,'CMCCode'=>'CMC-001','Brand'=>'Dell','Classification'=>'Laptop','SerialNumber'=>'SN-111','DatePurchased'=>'2023-02-01','HostName':'CMC-LAP-01','OperatingSystem'=>'Windows 11','Status':'In Use','RAM':'16 GB','Processor':'i7','IP':'10.0.0.10','MAC':'00:11:22:33','User':'Admin','Department':'IT','Building':'Tower1','Remarks':'Assigned' ],
  [ 'id'=>2,'CMCCode'=>'CMC-002','Brand'=>'HP','Classification'=>'System Unit','SerialNumber'=>'SN-222','DatePurchased'=>'2022-10-10','HostName':'CMC-PC-02','OperatingSystem':'Windows 10','Status':'In Stock','RAM':'8 GB','Processor':'i5','IP':'','MAC':'','User':'','Department':'','Building':'Tower2','Remarks':'' ],
  [ 'id'=>3,'CMCCode'=>'CMC-003','Brand'=>'AOC','Classification'=>'Monitor','SerialNumber'=>'SN-333','DatePurchased'=>'2021-05-20','HostName':'','OperatingSystem':'','Status':'Maintenance','RAM':'','Processor':'','IP':'','MAC':'','User':'','Department':'','Building':'Tower3','Remarks':'Screen issue' ],
];
json_response($data);