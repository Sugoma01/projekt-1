<?php
session_start();
$connectionPath = '..\..\database\connect.php';
if (!$connectionPath) {
    die("Datei nicht gefunden: " . __DIR__ . '/../../database/connection.php');
}
require_once($connectionPath);

if (!isset($_SESSION['user'])) {
    header("Location: ../login/login.php");
    exit;
}

;

?>
<script>console.log(<?php echo json_encode($_SESSION['user']); ?>);</script>

<link rel="stylesheet" href="./css/style.css">
<script src="../../js/jquery-3.7.1.min.js"></script>
<script type="module" src="./js/app.js"></script>


<body>
    <header>
        <name><?php echo $_SESSION['user']; ?></name>
        <resdisplay id="credits"></resdisplay>
        <resdisplay id="material_raw_metals"></resdisplay>
        <resdisplay id="material_fabrics"></resdisplay>
        <resdisplay id="material_equipment"></resdisplay>
    </header>

    <factories>
        <!-- Factorys will be added here -->
    </factories>

    <footer>
        <button id="VUE">Marktplatz</button>
        <button id="Workers">Arbeiter Anwerben</button>
        <button id="Lager">Statistiken</button>
        <button id="endRound">Runde Beenden</button>
    </footer>

    <overlay>
        <!-- Event messages will be added here -->
    </overlay>
</body>