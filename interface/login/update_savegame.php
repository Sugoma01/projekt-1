<?php
session_start();
require_once __DIR__ . '/../../database/connect.php';
header('Content-Type: application/json');
if (!isset($_SESSION['user'])) {
    http_response_code(401);
    echo json_encode(['error'=>'Unauthorized']);
    exit;
}
$data = json_decode(file_get_contents('php://input'), true);
$conn = getConnection();
$stmt = $conn->prepare("SELECT gs.ID FROM gamestates gs JOIN players p ON gs.PlayerID = p.ID WHERE p.Name = ?");
$stmt->bind_param('s', $_SESSION['user']);
$stmt->execute();
$stmt->bind_result($gsid);
$stmt->fetch();
$stmt->close();
$u = $conn->prepare("UPDATE resources SET CreditPoints=?, RawMaterials=?, Tools=?, Steel=?, Clothing=?, Furniture=? WHERE GameStateID=?");
$u->bind_param('iiiiiii',
    $data['ressources']['credits'],
    $data['ressources']['material_raw_metals'],
    $data['ressources']['material_equipment'],
    $data['ressources']['processed_steel'],
    $data['ressources']['processed_Clothes'],
    $data['ressources']['processed_furniture'],
    $gsid
);
$u->execute();
$u->close();
$m = $conn->prepare("UPDATE market SET RawMaterialsPrice=?, ToolsPrice=?, SteelPrice=?, ClothingPrice=?, FurniturePrice=? WHERE GameStateID=?");
$rmP = $data['marketValues']['material_raw_metals']*100;
$tp  = $data['marketValues']['material_equipment']*100;
$sp  = $data['marketValues']['processed_steel']*100;
$cp  = $data['marketValues']['processed_Clothes']*100;
$fp  = $data['marketValues']['processed_furniture']*100;
$m->bind_param('iiiiii',$rmP,$tp,$sp,$cp,$fp,$gsid);
$m->execute();
$m->close();
$conn->query("DELETE FROM factories WHERE GameStateID={$gsid}");
$i = $conn->prepare("INSERT INTO factories (Type, Modifier, ModifierTime, ModifierDescription, Workers, GameStateID) VALUES (?,?,?,?,?,?)");
foreach ($data['factoryList'] as $f) {
    $i->bind_param('siisii',
        $f['type'],
        $f['modifer'],
        $f['modifer_time'],
        $f['modifer_description'],
        $f['workers'],
        $gsid
    );
    $i->execute();
}
$i->close();
$conn->close();
echo json_encode(['status'=>'ok']);
