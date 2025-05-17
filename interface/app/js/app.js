var saveGame = {
    ressources: {
        "credits": 100,
        "material_raw_metals": 0,
        "material_fabrics": 0,
        "material_equipment": 0,
        "processed_steel": 0,
        "processed_Clothes": 0,
        "processed_furniture": 0
    },
    marketValues: {
        "material_raw_metals": 0.86,
        "material_fabrics": 0.77,
        "material_equipment": 1,
        "processed_steel": 4,
        "processed_Clothes": 2,
        "processed_furniture": 5
    },
    factoryList:
    {
        0: {
            type: "mine",
            workers: 5,
            modifer: 0,
            modifer_time: 0,
            modifer_description: ""
        },
        1: {
            type: "steel",
            workers: 5,
            modifer: 0,
            modifer_time: 0,
            modifer_description: ""
        }
    }
}
var oldSavegame = {};
var roundLog = "";

const namesOfMaterials = {
    "credits": "Credits",
    "material_raw_metals": "Rohstoffe",
    "material_fabrics": "Stoffe",
    "material_equipment": "Hilfsmittel",
    "processed_steel": "Stahl",
    "processed_Clothes": "Kleidung",
    "processed_furniture": "Möbel"
}

function loadSavegame() {
    const ressources = saveGame.ressources;
    updateResourcesUI(ressources);

    const factoryList = saveGame.factoryList;
    if (Object.keys(factoryList).length === 0) return;

    const factoryElement = $('factories');
    const factoriesHtml = buildFactoriesHtml(factoryList);
    clearFactories(factoryElement)
    factoryElement.append(factoriesHtml);
}

function updateResourcesUI(ressources) {
    $("#credits").html(namesOfMaterials.credits + ressources.credits);
    $("#material_raw_metals").html(namesOfMaterials.material_raw_metals +
        ressources.material_raw_metals);
    $("#material_fabrics").html(namesOfMaterials.material_fabrics +
        ressources.material_fabrics);
    $("#material_equipment").html(namesOfMaterials.material_equipment +
        ressources.material_equipment);
}

function buildFactoriesHtml(factoryList) {
    let html = `
        <layer>
            <ort>Fabriken</ort>
            <list>
    `;

    for (const factoryName in factoryList) {
        html += buildFactoryHtml(factoryList[factoryName]);
    }

    html += `
                <factory id="addFactory">
                    <p>+</p>
                </factory>
            </list>
        </layer>
    `;

    return html;
}

function clearFactories(factoryElement) {
    factoryElement.empty();
};


function buildFactoryHtml(factoryStatus) {
    const factoryType = eval(factoryStatus.type);
    let html = `
        <factory>
            <factoryname>${factoryType.name}</factoryname>
    `;

    if (factoryStatus.modifer !== 0) {
        html += `
            <factorytype class="badModifer">${factoryStatus.modifer_description}</factorytype>
            <factorytype class="badModifer">Einbußen: ${100 - factoryStatus.modifer * 100}%</factorytype>
        `;
    } else {
        html += buildFactoryRequirementsHtml(factoryType);
        html += buildFactoryOutputHtml(factoryType);
    }

    html += `
        <factoryworkers>${factoryStatus.workers}/${factoryType.workers}</factoryworkers>
        </factory>
    `;

    return html;
}

function buildFactoryRequirementsHtml(factoryType) {
    return factoryType.requirements
        .filter(req => req.type)
        .map(req => `<fabriktype>-${req.amount} ${namesOfMaterials[req.type]}</fabriktype>`)
        .join('');
}

function buildFactoryOutputHtml(factoryType) {
    return factoryType.output
        .map(out => `<fabriktype>+${out.amount} ${namesOfMaterials[out.type]}</fabriktype>`)
        .join('');
}

class Factory {
    constructor({ name, requirements = [], output = [], workers = 0, cost = [] }) {
        this.name = name;
        this.requirements = requirements;
        this.output = output;
        this.workers = workers;
        this.cost = this.cost;
    }
}


const steel = new Factory({
    name: "Stahlgießerei",
    requirements: [{ type: "material_raw_metals", amount: 5 }],
    output: [{ type: "processed_steel", amount: 5 }],
    workers: 5,
    cost: [{
        type: "material_raw_metals",
        amount: 50
    }]
});

const farm = new Factory({
    name: "Farm",
    requirements: [{}],
    output: [{ type: "material_fabrics", amount: 8 }],
    workers: 5,
    cost: [{
        type: "material_raw_metals",
        amount: 20
    }]
});

const mine = new Factory({
    name: "Bergbau",
    requirements: [{}],
    output: [{ type: "material_raw_metals", amount: 10 }],
    workers: 8,
    cost: [{
        type: "material_raw_metals",
        amount: 20
    }]
});


const equip = new Factory({
    name: "Ausrüstung",
    requirements: [{ type: "material_raw_metals", amount: 5 }, { type: "material_fabrics", amount: 5 }],
    output: [{ type: "material_equipment", amount: 8 }],
    workers: 5,
    cost: [{
        type: "material_raw_metals",
        amount: 30
    }]
});
const factoryDefinitions = {
    "steel": steel,
    "farm": farm,
    "mine": mine,
    "equip": equip,
}
for (let factoryList = 0; factoryList < saveGame.factoryList.length; factoryList++) {
    const element = saveGame.factoryList[factoryList];
    if (element) console.log(element);

}


function randomEvent() {
    switch (ranInt(1, 3)) {
        case 1: strikeEvent(); break;
        case 2: disatserEvent(); break;
        case 3: marketChangeEvent(); break;
    }
}
function strikeEvent() {
    let amount_factory = ranInt(1, saveGame.factoryList.length / 2);
    let amount_decrease = ranInt(10, 60);
    let affected_factorys = [];

    let output = "";
    output += "amount_factory: " + amount_factory + "<br>";
    output += "amount_decrease: " + amount_decrease + "<br>";

    for (let i = 0; i < affected_factorys.length; i++) {
        output += affected_factorys[i] + "<br>";
    }

    overlay("Streik in der Arbeiterschaft!", "Beischreibung", [], []);
}
function disatserEvent() {

}

function marketChangeEvent() {
    let random_ressource = ranInt(1, Object.keys(saveGame.marketValues).length - 1)
    let ressourceType = Object.keys(saveGame.marketValues)[random_ressource];

    saveGame.marketValues[ressourceType] = ranInt(1, 100) / 10;
    console.log(ressourceType, saveGame.marketValues[ressourceType]);
}


function overlay(Title, description, option1 = [], option2 = []) {
    const overlay_html = $("overlay")

    overlay_html
        .css({
            "display": "flex"
        })

    overlay_html.find("h1").text(Title)
    overlay_html.find("p").text(description)

    let opt1Element = overlay_html.find("#option1");
    let opt2Element = overlay_html.find("#option2");

    if (option1) opt1Element.text(option1).css({ "display": "block" });
    else opt1Element.css({ "display": "none" });

    if (option2) opt2Element.text(option2).css({ "display": "block" });
    else opt2Element.css({ "display": "none" });

}

function ranInt(frist, last) {
    return Math.floor(Math.random() * last) + frist;
}

function marketViewer() {
    closeOverlay();
    const overlay_html = $("overlay")
    overlay_html
        .css({
            "display": "flex"
        })
    overlay_html.find("h1").text("Markt")
    overlay_html.find("table").remove()
    let table = $("<table>")
    let header = $("<tr>")
    header.append("<th>Item</th>")
    header.append("<th>Preis</th>")
    header.append("<th>Kaufen</th>")
    header.append("<th>Verkaufen</th>")
    table.append(header)

    for (let i = 0; i < Object.keys(saveGame.marketValues).length; i++) {
        let key = Object.keys(saveGame.marketValues)[i]
        let row = $("<tr>")
        row.append("<td>" + namesOfMaterials[key] + "</td>")
        row.append("<td>" + saveGame.marketValues[key] + "</td>")
        row.append('<td><button class="buy-button" data-item="' + key + '">Kaufen</button></td>')
        row.append('<td><button class="sell-button" data-item="' + key + '">Verkaufen</button></td>')
        table.append(row)
    }

    overlay_html.append(table)

    $(".buy-button").on("click", function () {
        const item = $(this).data("item")
        addBuyParam(item)
        loadSavegame();
        marketViewer();
        this.off("click")
    })

    $(".sell-button").on("click", function () {
        const item = $(this).data("item")
        addSellParam(item)
        loadSavegame();
        marketViewer();
        this.off("click")
    })
}
function addSellParam(item) {
    const price = saveGame.marketValues[item]
    if (saveGame.ressources[item] > 0) {
        saveGame.ressources[item] -= 1
        saveGame.ressources["credits"] = round(saveGame.ressources["credits"] + price)
    }
}

function addBuyParam(item) {
    const price = saveGame.marketValues[item]
    if (saveGame.ressources["credits"] >= price) {
        saveGame.ressources["credits"] = round(saveGame.ressources["credits"] - price)
        if (!saveGame.ressources[item]) saveGame.ressources[item] = 0
        saveGame.ressources[item] += 1
    }
}
function showStorage() {
    closeOverlay();
    const overlay_html = $("overlay")
    overlay_html
        .css({
            "display": "flex"
        })
    overlay_html.find("h1").text("Lager")
    overlay_html.find("table").remove()
    let table = $("<table>")
    let header = $("<tr>")
    header.append("<th>Item</th>")
    header.append("<th>Anzahl</th>")
    table.append(header)

    for (let i = 0; i < Object.keys(saveGame.ressources).length; i++) {
        let key = Object.keys(saveGame.ressources)[i]
        let row = $("<tr>")
        row.append("<td>" + namesOfMaterials[key] + "</td>")
        row.append("<td>" + saveGame.ressources[key] + "</td>")
        table.append(row)
    }
    overlay_html.append(table)
}

function closeOverlay() {
    const overlay_html = $("overlay")
    overlay_html
        .css({
            "display": "none"
        })
}

function addNavClick(id, to) {
    var element = $("#" + id);
    element.click(function () {
        eval(to);
        element.off("click")
        element.on("click", function () {
            closeOverlay();
            addNavClick(id, to);
        })
    })
}
function round(number) {
    return Math.round(number * 100) / 100
}

function roundStart() {
    oldSavegame = saveGame;
    loadSavegame();
    roundLog = [];
}

function getFactoryEfficiency(factory) {
    const def = factoryDefinitions[factory.type]
    if (!def) return 0
    const workerRatio = Math.min(factory.workers / def.workers, 1)
    const modifier = factory.modifer > 0 ? factory.modifer : 1
    return workerRatio * modifier
}

function calcRoundEnd() {
    const addedRessources = {
        "material_raw_metals": 0,
        "material_fabrics": 0,
        "material_equipment": 0,
        "processed_steel": 0,
        "processed_Clothes": 0,
        "processed_furniture": 0
    }

    for (let id in saveGame.factoryList) {
        const factory = saveGame.factoryList[id]
        const def = factoryDefinitions[factory.type]
        if (!def) continue
        const efficiency = getFactoryEfficiency(factory)
        for (let out of def.output) {
            if (!addedRessources[out.type]) addedRessources[out.type] = 0
            addedRessources[out.type] += out.amount * efficiency
        }
    }

    for (let key in addedRessources) {
        addedRessources[key] = round(addedRessources[key])
    }

    generateRoundLogTable(addedRessources);

    return { addedRessources }
}

function generateRoundLogTable(addedRessources) {
    let html = `<table border="1"><tr>
        <th>Fabrik</th>
        <th>Basisproduktion</th>
        <th>Malus durch Unterbesetzung</th>
        <th>Malus durch Event</th>
        <th>Finaler Output</th>
        <th>Typ der Output-Ressource</th>
        <th>Input-Ressourcen</th>
    </tr>`;

    for (let id in saveGame.factoryList) {
        const factory = saveGame.factoryList[id];
        const def = factoryDefinitions[factory.type];
        if (!def) continue;

        const workerRatio = Math.min(factory.workers / def.workers, 1);
        const modifier = factory.modifer > 0 ? factory.modifer : 1;
        const eventMalus = modifier < 1 ? (1 - modifier) : 0;
        const efficiency = getFactoryEfficiency(factory);

        def.output.forEach(out => {
            const finalOutput = round(out.amount * efficiency);
            const inputStr = def.requirements
                .filter(r => r.type)
                .map(r => `${r.amount} ${namesOfMaterials[r.type]}`)
                .join(", ") || "-";

            html += `<tr>
                <td>${def.name}</td>
                <td>${out.amount}</td>
                <td>${round((1 - workerRatio) * 100)}%</td>
                <td>${round(eventMalus * 100)}%</td>
                <td>${finalOutput}</td>
                <td>${namesOfMaterials[out.type]}</td>
                <td>${inputStr}</td>
            </tr>`;
        });
    }

    html += "</table><br/>";
    roundLog += html;
}
function showWorkerRecruitment() {
    closeOverlay();
    const overlay_html = $("overlay");
    overlay_html.css({ "display": "flex" });
    overlay_html.find("h1").text("Arbeiter anwerben");
    overlay_html.find("p").text("Hier kannst du deine Fabriken mit zusätzlichen Arbeitern ausstatten.");
    overlay_html.find("table").remove();
    overlay_html.find("button").remove();


    let table = $("<table>");
    let header = $("<tr>");
    header.append("<th>Fabrik</th>");
    header.append("<th>Arbeiter</th>");
    header.append("<th>Aktion</th>");
    table.append(header);

    for (const id in saveGame.factoryList) {
        const factory = saveGame.factoryList[id];
        const def = factoryDefinitions[factory.type];
        if (!def) continue;

        const row = $("<tr>");
        row.append("<td>" + def.name + "</td>");
        row.append("<td>" + factory.workers + "/" + def.workers + "</td>");

        if (factory.workers < def.workers) {
            const recruitBtn = $("<button>Anwerben</button>");
            recruitBtn.on("click", function () {
                factory.workers += 1;
                if (factory.workers > def.workers) factory.workers = def.workers;
                showWorkerRecruitment();
            });
            row.append($("<td>").append(recruitBtn));
        } else {
            row.append("<td>Voll besetzt</td>");
        }

        table.append(row);
    }

    overlay_html.append(table);

    const closeBtn = $("<button>Schließen</button>");
    closeBtn.on("click", function () {
        closeOverlay();
        loadSavegame();
    });
    overlay_html.append(closeBtn);
}



$(document).ready(function () {
    roundStart()
    addNavClick("VUE", "marketViewer()");
    addNavClick("Lager", "showStorage()");
    addNavClick("endRound", "console.log(calcRoundEnd(), roundLog);");
    addNavClick("Workers", "showWorkerRecruitment()");
});















// saveGame = {};


// function fetchSavegame() {
//     return fetch('getSavegame.php', { credentials: 'include' })
//         .then(r => r.json())
//         .then(data => { saveGame = data })
// }

// function saveSavegame() {
//     return fetch('update_savegame.php', {
//         method: 'POST',
//         credentials: 'include',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(saveGame)
//     }).then(r => r.json())
// }

// document.addEventListener('DOMContentLoaded', () => {
//     fetchSavegame().then(() => {
//         saveGame = {
//             ressources: {
//                 "credits": 100,
//                 "material_raw_metals": 0,
//                 "material_fabrics": 0,
//                 "material_equipment": 0,
//                 "processed_steel": 0,
//                 "processed_Clothes": 0,
//                 "processed_furniture": 0
//             },
//             marketValues: {
//                 "material_raw_metals": 0.86,
//                 "material_fabrics": 0.77,
//                 "material_equipment": 1,
//                 "processed_steel": 4,
//                 "processed_Clothes": 2,
//                 "processed_furniture": 5
//             },
//             factoryList:
//             {
//                 0: {
//                     type: "mine",
//                     workers: 5,
//                     modifer: 0,
//                     modifer_time: 0,
//                     modifer_description: ""
//                 },
//                 1: {
//                     type: "steel",
//                     workers: 5,
//                     modifer: 0,
//                     modifer_time: 0,
//                     modifer_description: ""
//                 }
//             }
//         }
//         roundStart()
//         addNavClick("VUE", "marketViewer()")
//         addNavClick("Lager", "showStorage()")

//         document.getElementById('endRound').addEventListener('click', () => {
//             const result = calcRoundEnd()
//             roundLog = result
//             saveSavegame().then(() => loadSavegame())
//         })
//     })
// })