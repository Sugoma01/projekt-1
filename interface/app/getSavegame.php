<?php
session_start();
require_once __DIR__ . '/../../database/connect.php';
header('Content-Type: application/json');
if (!isset($_SESSION['user'])) {
    http_response_code(401);
    echo json_encode(['error'=>'Unauthorized']);
    exit;
}
$conn = getConnection();
$stmt = $conn->prepare("
    SELECT gs.ID AS gamestate_id, r.CreditPoints, r.RawMaterials, r.Tools, r.Steel, r.Clothing, r.Furniture,
           m.RawMaterialsPrice, m.ToolsPrice, m.SteelPrice, m.ClothingPrice, m.FurniturePrice
    FROM gamestates gs
    JOIN players p ON gs.PlayerID = p.ID
    JOIN resources r ON r.GameStateID = gs.ID
    JOIN market m ON m.GameStateID = gs.ID
    WHERE p.Name = ?
");
$stmt->bind_param('s', $_SESSION['user']);
$stmt->execute();
$stmt->bind_result($gsid, $credits, $rm, $tools, $steel, $cloth, $furn, $rmP, $toolsP, $steelP, $clothP, $furnP);
$stmt->fetch();
$stmt->close();
$fStmt = $conn->prepare("SELECT Type, Modifier, ModifierTime, ModifierDescription, Workers FROM factories WHERE GameStateID = ?");
$fStmt->bind_param('i', $gsid);
$fStmt->execute();
$fStmt->bind_result($type, $mod, $mtime, $mdesc, $workers);
$factories = [];
while ($fStmt->fetch()) {
    $factories[] = [
        'type'=>$type,
        'modifer'=>$mod,
        'modifer_time'=>$mtime,
        'modifer_description'=>$mdesc,
        'workers'=>$workers
    ];
}
$fStmt->close();
$conn->close();
echo json_encode([
    'ressources'=>[
        'credits'=>$credits,
        'material_raw_metals'=>$rm,
        'material_fabrics'=>$cloth,
        'material_equipment'=>$tools,
        'processed_steel'=>$steel,
        'processed_Clothes'=>$cloth,
        'processed_furniture'=>$furn
    ],
    'marketValues'=>[
        'material_raw_metals'=>$rmP/100,
        'material_fabrics'=>$clothP/100,
        'material_equipment'=>$toolsP/100,
        'processed_steel'=>$steelP/100,
        'processed_Clothes'=>$clothP/100,
        'processed_furniture'=>$furnP/100
    ],
    'factoryList'=>$factories
]);
