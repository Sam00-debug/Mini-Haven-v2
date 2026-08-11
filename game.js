/* =====================================================
   MINI HAVEN
   CANVAS MAP VERSION
===================================================== */

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

ctx.imageSmoothingEnabled = true;


/* =====================================================
   SETTINGS
===================================================== */

const WORLD_WIDTH = 3200;
const WORLD_HEIGHT = 2500;

const MAP_CENTER_X = WORLD_WIDTH / 2;
const MAP_CENTER_Y = WORLD_HEIGHT / 2;

const MAP_RADIUS_X = 1510;
const MAP_RADIUS_Y = 1160;


/* =====================================================
   CANVAS
===================================================== */

let width = 0;
let height = 0;
let dpr = 1;

function resize() {

    width = window.innerWidth;
    height = window.innerHeight;

    dpr = Math.min(
        window.devicePixelRatio || 1,
        2
    );

    canvas.width = width * dpr;
    canvas.height = height * dpr;

    canvas.style.width = width + "px";
    canvas.style.height = height + "px";

    ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );
}

window.addEventListener("resize", resize);

window.addEventListener(
    "orientationchange",
    () => setTimeout(resize, 100)
);

resize();


/* =====================================================
   COLORS
===================================================== */

const C = {

    water: "#55c4d2",
    waterDark: "#3eabbc",
    waterLight: "#76d5df",

    grass: "#69b75b",
    grassDark: "#438f49",
    grassLight: "#86c96a",

    forest: "#4a9d4e",

    snow: "#eef5f4",
    snowShadow: "#d9e5e5",

    sand: "#e9c47b",
    sandDark: "#c99e5c",

    road: "#62676a",
    roadDark: "#4c5154",
    roadLine: "#d7d8d1",

    wood: "#9d7046",
    woodLight: "#bd8a52",

    building: "#e8c27d",
    buildingDark: "#bd8756",

    roof: "#9a5145",
    roofDark: "#703d39",

    stone: "#969b9b",
    stoneDark: "#737878",

    flower: "#ef6b66",

    white: "#ffffff",

    dark: "#263238"
};


/* =====================================================
   SEEDED RANDOM
===================================================== */

function randomHash(x, y, seed = 0) {

    const n = Math.sin(
        x * 127.1 +
        y * 311.7 +
        seed * 74.7
    ) * 43758.5453;

    return n - Math.floor(n);
}


/* =====================================================
   BASIC DRAW HELPERS
===================================================== */

function rect(x, y, w, h, color) {

    ctx.fillStyle = color;

    ctx.fillRect(
        x,
        y,
        w,
        h
    );
}


function roundRect(
    x,
    y,
    w,
    h,
    radius,
    color
) {

    ctx.fillStyle = color;

    ctx.beginPath();

    ctx.roundRect(
        x,
        y,
        w,
        h,
        radius
    );

    ctx.fill();
}


function circle(
    x,
    y,
    r,
    color
) {

    ctx.fillStyle = color;

    ctx.beginPath();

    ctx.arc(
        x,
        y,
        r,
        0,
        Math.PI * 2
    );

    ctx.fill();
}


function line(
    x1,
    y1,
    x2,
    y2,
    color,
    width = 2
) {

    ctx.strokeStyle = color;
    ctx.lineWidth = width;

    ctx.beginPath();

    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);

    ctx.stroke();
}


/* =====================================================
   WATER
===================================================== */

function drawWater() {

    rect(
        0,
        0,
        WORLD_WIDTH,
        WORLD_HEIGHT,
        C.water
    );

    /*
        Water waves
    */

    for (
        let y = 20;
        y < WORLD_HEIGHT;
        y += 70
    ) {

        for (
            let x = 20;
            x < WORLD_WIDTH;
            x += 90
        ) {

            const r =
                randomHash(
                    x,
                    y,
                    12
                );

            if (r > .55) {

                ctx.strokeStyle =
                    "rgba(255,255,255,.35)";

                ctx.lineWidth = 2;

                ctx.beginPath();

                ctx.moveTo(
                    x,
                    y
                );

                ctx.quadraticCurveTo(
                    x + 7,
                    y - 4,
                    x + 14,
                    y
                );

                ctx.quadraticCurveTo(
                    x + 21,
                    y + 4,
                    x + 28,
                    y
                );

                ctx.stroke();
            }
        }
    }
}


/* =====================================================
   ISLAND SHAPES
===================================================== */

const islands = [

    /*
        Top-left forest island
    */

    {
        x: 90,
        y: 120,
        w: 760,
        h: 690,
        type: "forest"
    },

    /*
        Top-center
    */

    {
        x: 970,
        y: 70,
        w: 570,
        h: 520,
        type: "grass"
    },

    /*
        Top-right snow island
    */

    {
        x: 1900,
        y: 40,
        w: 980,
        h: 700,
        type: "snow"
    },

    /*
        Middle-left forest
    */

    {
        x: 60,
        y: 850,
        w: 780,
        h: 630,
        type: "forest"
    },

    /*
        Middle-center
    */

    {
        x: 900,
        y: 650,
        w: 1250,
        h: 1100,
        type: "grass"
    },

    /*
        Middle-right rocky island
    */

    {
        x: 2180,
        y: 790,
        w: 730,
        h: 610,
        type: "rock"
    },

    /*
        Bottom-left desert
    */

    {
        x: 70,
        y: 1540,
        w: 1050,
        h: 850,
        type: "desert"
    },

    /*
        Bottom-center
    */

    {
        x: 1100,
        y: 1730,
        w: 720,
        h: 680,
        type: "grass"
    },

    /*
        Bottom-right forest
    */

    {
        x: 1780,
        y: 1500,
        w: 1050,
        h: 850,
        type: "forest"
    }
];


/* =====================================================
   DRAW ISLAND
===================================================== */

function drawIsland(island, index) {

    let color = C.grass;

    if (island.type === "forest")
        color = C.forest;

    if (island.type === "snow")
        color = C.snow;

    if (island.type === "desert")
        color = C.sand;

    if (island.type === "rock")
        color = C.stone;


    /*
        Irregular island shadow
    */

    ctx.save();

    ctx.beginPath();

    ctx.roundRect(
        island.x + 8,
        island.y + 8,
        island.w,
        island.h,
        70
    );

    ctx.fillStyle =
        "rgba(0,0,0,.12)";

    ctx.fill();


    /*
        Main island
    */

    ctx.beginPath();

    ctx.roundRect(
        island.x,
        island.y,
        island.w,
        island.h,
        65
    );

    ctx.fillStyle = color;

    ctx.fill();

    ctx.restore();


    /*
        Small coastline pixels
    */

    for (
        let y = island.y + 25;
        y < island.y + island.h - 20;
        y += 48
    ) {

        for (
            let x = island.x + 25;
            x < island.x + island.w - 20;
            x += 52
        ) {

            const r =
                randomHash(
                    x,
                    y,
                    index + 50
                );

            if (r > .82) {

                if (
                    island.type === "snow"
                ) {

                    circle(
                        x,
                        y,
                        5,
                        C.snowShadow
                    );

                } else if (
                    island.type === "desert"
                ) {

                    circle(
                        x,
                        y,
                        4,
                        C.sandDark
                    );

                } else {

                    circle(
                        x,
                        y,
                        3,
                        C.grassDark
                    );
                }
            }
        }
    }
}


/* =====================================================
   TREES
===================================================== */

function drawTree(
    x,
    y,
    scale = 1
) {

    /*
        Shadow
    */

    ctx.globalAlpha = .22;

    circle(
        x,
        y + 15 * scale,
        13 * scale,
        "#000"
    );

    ctx.globalAlpha = 1;


    /*
        Trunk
    */

    rect(
        x - 4 * scale,
        y + 2 * scale,
        8 * scale,
        18 * scale,
        "#75492d"
    );


    /*
        Leaves
    */

    circle(
        x,
        y - 5 * scale,
        15 * scale,
        C.treeDark || "#347346"
    );

    circle(
        x - 9 * scale,
        y + 2 * scale,
        11 * scale,
        "#347346"
    );

    circle(
        x + 9 * scale,
        y + 2 * scale,
        11 * scale,
        "#438b50"
    );

    circle(
        x,
        y - 11 * scale,
        9 * scale,
        "#5ca75b"
    );
}


/* =====================================================
   DESERT CACTUS
===================================================== */

function drawCactus(
    x,
    y,
    scale = 1
) {

    rect(
        x - 4 * scale,
        y - 18 * scale,
        8 * scale,
        30 * scale,
        "#4d9c4d"
    );

    rect(
        x - 13 * scale,
        y - 8 * scale,
        9 * scale,
        6 * scale,
        "#4d9c4d"
    );

    rect(
        x + 4 * scale,
        y - 14 * scale,
        9 * scale,
        6 * scale,
        "#4d9c4d"
    );
}


/* =====================================================
   SNOW TREE
===================================================== */

function drawSnowTree(
    x,
    y,
    scale = 1
) {

    rect(
        x - 3 * scale,
        y,
        6 * scale,
        17 * scale,
        "#79563b"
    );

    circle(
        x,
        y - 6 * scale,
        13 * scale,
        "#427c57"
    );

    circle(
        x,
        y - 15 * scale,
        9 * scale,
        "#4c8c61"
    );

    circle(
        x,
        y - 22 * scale,
        5 * scale,
        "#5c9a70"
    );

    /*
        Snow
    */

    ctx.strokeStyle =
        "#ffffff";

    ctx.lineWidth =
        4 * scale;

    ctx.beginPath();

    ctx.moveTo(
        x - 9 * scale,
        y - 10 * scale
    );

    ctx.lineTo(
        x + 5 * scale,
        y - 14 * scale
    );

    ctx.stroke();
}


/* =====================================================
   ROCK
===================================================== */

function drawRock(
    x,
    y,
    scale = 1
) {

    ctx.fillStyle =
        C.stoneDark;

    ctx.beginPath();

    ctx.moveTo(
        x - 13 * scale,
        y + 8 * scale
    );

    ctx.lineTo(
        x - 8 * scale,
        y - 8 * scale
    );

    ctx.lineTo(
        x + 5 * scale,
        y - 13 * scale
    );

    ctx.lineTo(
        x + 14 * scale,
        y
    );

    ctx.lineTo(
        x + 8 * scale,
        y + 10 * scale
    );

    ctx.closePath();

    ctx.fill();

    circle(
        x - 2 * scale,
        y - 5 * scale,
        4 * scale,
        "#b3b7b7"
    );
}


/* =====================================================
   DECORATIONS
===================================================== */

function populateNature() {

    for (
        let i = 0;
        i < islands.length;
        i++
    ) {

        const island =
            islands[i];

        const count =
            Math.floor(
                island.w *
                island.h /
                15000
            );


        for (
            let n = 0;
            n < count;
            n++
        ) {

            const x =
                island.x +
                25 +
                randomHash(
                    n,
                    i,
                    500
                ) *
                (island.w - 50);

            const y =
                island.y +
                25 +
                randomHash(
                    n,
                    i,
                    900
                ) *
                (island.h - 50);


            /*
                Avoid center roads area
            */

            if (
                island.type === "desert"
            ) {

                if (
                    randomHash(
                        n,
                        i,
                        1000
                    ) > .45
                ) {

                    drawCactus(
                        x,
                        y,
                        .7 +
                        randomHash(
                            n,
                            i,
                            1200
                        ) * .5
                    );
                }

            } else if (
                island.type === "snow"
            ) {

                drawSnowTree(
                    x,
                    y,
                    .7 +
                    randomHash(
                        n,
                        i,
                        1300
                    ) * .5
                );

            } else if (
                island.type === "rock"
            ) {

                drawRock(
                    x,
                    y,
                    .7 +
                    randomHash(
                        n,
                        i,
                        1400
                    ) * .6
                );

            } else {

                drawTree(
                    x,
                    y,
                    .65 +
                    randomHash(
                        n,
                        i,
                        1500
                    ) * .55
                );
            }
        }
    }
}


/* =====================================================
   ROADS
===================================================== */

function drawRoadH(
    x,
    y,
    w
) {

    rect(
        x,
        y - 22,
        w,
        44,
        C.roadDark
    );

    rect(
        x,
        y - 18,
        w,
        36,
        C.road
    );


    /*
        Road markings
    */

    for (
        let p = x + 15;
        p < x + w;
        p += 55
    ) {

        rect(
            p,
            y - 2,
            30,
            4,
            C.roadLine
        );
    }
}


function drawRoadV(
    x,
    y,
    h
) {

    rect(
        x - 22,
        y,
        44,
        h,
        C.roadDark
    );

    rect(
        x - 18,
        y,
        36,
        h,
        C.road
    );


    for (
        let p = y + 15;
        p < y + h;
        p += 55
    ) {

        rect(
            x - 2,
            p,
            4,
            30,
            C.roadLine
        );
    }
}


/* =====================================================
   BRIDGES
===================================================== */

function drawBridgeH(
    x,
    y,
    w
) {

    rect(
        x,
        y - 28,
        w,
        56,
        C.wood
    );

    for (
        let p = x;
        p < x + w;
        p += 24
    ) {

        rect(
            p,
            y - 27,
            4,
            54,
            C.woodLight
        );
    }

    line(
        x,
        y - 27,
        x + w,
        y - 27,
        "#704a2d",
        4
    );

    line(
        x,
        y + 27,
        x + w,
        y + 27,
        "#704a2d",
        4
    );
}


function drawBridgeV(
    x,
    y,
    h
) {

    rect(
        x - 28,
        y,
        56,
        h,
        C.wood
    );

    for (
        let p = y;
        p < y + h;
        p += 24
    ) {

        rect(
            x - 27,
            p,
            54,
            4,
            C.woodLight
        );
    }
}


/* =====================================================
   CENTRAL BUILDINGS
===================================================== */

function drawBuilding(
    x,
    y,
    w,
    h,
    roof = C.roof
) {

    /*
        Shadow
    */

    roundRect(
        x + 8,
        y + 8,
        w,
        h,
        8,
        "rgba(0,0,0,.18)"
    );


    /*
        Building
    */

    roundRect(
        x,
        y,
        w,
        h,
        7,
        C.building
    );


    /*
        Roof
    */

    ctx.fillStyle =
        roof;

    ctx.beginPath();

    ctx.moveTo(
        x - 6,
        y + 10
    );

    ctx.lineTo(
        x + w / 2,
        y - 18
    );

    ctx.lineTo(
        x + w + 6,
        y + 10
    );

    ctx.closePath();

    ctx.fill();


    /*
        Door
    */

    rect(
        x + w / 2 - 10,
        y + h - 30,
        20,
        30,
        "#67412e"
    );


    /*
        Windows
    */

    rect(
        x + 15,
        y + 28,
        22,
        18,
        "#83cce0"
    );

    rect(
        x + w - 37,
        y + 28,
        22,
        18,
        "#83cce0"
    );
}


/* =====================================================
   CENTRAL HALL
===================================================== */

function drawCentralHall() {

    const x = 1360;
    const y = 1080;

    /*
        Plaza
    */

    roundRect(
        x - 230,
        y - 190,
        460,
        380,
        45,
        "#78bd64"
    );


    /*
        Path around hall
    */

    roundRect(
        x - 190,
        y - 150,
        380,
        300,
        30,
        C.road
    );


    /*
        Grass interior
    */

    roundRect(
        x - 160,
        y - 120,
        320,
        240,
        25,
        "#72b95e"
    );


    /*
        Main hall
    */

    drawBuilding(
        x - 105,
        y - 60,
        210,
        125,
        "#e45c54"
    );


    /*
        Dome
    */

    ctx.fillStyle =
        "#f5d77d";

    ctx.beginPath();

    ctx.arc(
        x,
        y - 62,
        75,
        Math.PI,
        0
    );

    ctx.lineTo(
        x + 75,
        y - 45
    );

    ctx.lineTo(
        x - 75,
        y - 45
    );

    ctx.closePath();

    ctx.fill();


    /*
        Flag
    */

    rect(
        x - 3,
        y - 135,
        6,
        45,
        "#704a2d"
    );

    circle(
        x,
        y - 140,
        8,
        "#5aa8d8"
    );
}


/* =====================================================
   SPORTS FIELDS
===================================================== */

function drawField(
    x,
    y,
    w,
    h
) {

    roundRect(
        x,
        y,
        w,
        h,
        10,
        "#62b65c"
    );

    ctx.strokeStyle =
        "#f5f5e8";

    ctx.lineWidth = 4;

    ctx.strokeRect(
        x + 12,
        y + 12,
        w - 24,
        h - 24
    );


    /*
        Center line
    */

    line(
        x + w / 2,
        y + 12,
        x + w / 2,
        y + h - 12,
        "#f5f5e8",
        3
    );


    circle(
        x + w / 2,
        y + h / 2,
        24,
        "transparent"
    );

    ctx.strokeStyle =
        "#f5f5e8";

    ctx.beginPath();

    ctx.arc(
        x + w / 2,
        y + h / 2,
        24,
        0,
        Math.PI * 2
    );

    ctx.stroke();
}


/* =====================================================
   DOCKS
===================================================== */

function drawDock(
    x,
    y,
    vertical = false
) {

    if (!vertical) {

        rect(
            x,
            y,
            150,
            38,
            C.wood
        );

        for (
            let p = x;
            p < x + 150;
            p += 25
        ) {

            rect(
                p,
                y,
                4,
                38,
                C.woodLight
            );
        }

    } else {

        rect(
            x,
            y,
            38,
            150,
            C.wood
        );

        for (
            let p = y;
            p < y + 150;
            p += 25
        ) {

            rect(
                x,
                p,
                38,
                4,
                C.woodLight
            );
        }
    }
}


/* =====================================================
   VEHICLE
===================================================== */

function drawCar(
    x,
    y,
    color
) {

    roundRect(
        x - 18,
        y - 10,
        36,
        20,
        5,
        color
    );

    roundRect(
        x - 9,
        y - 7,
        18,
        10,
        3,
        "#c8e7ed"
    );

    circle(
        x - 12,
        y + 10,
        4,
        "#222"
    );

    circle(
        x + 12,
        y + 10,
        4,
        "#222"
    );
}


/* =====================================================
   STATIC MAP OBJECTS
===================================================== */

function drawMapObjects() {

    /*
        Main roads
    */

    drawRoadH(
        260,
        920,
        2500
    );

    drawRoadH(
        250,
        1430,
        2500
    );

    drawRoadV(
        760,
        200,
        2100
    );

    drawRoadV(
        1430,
        100,
        2250
    );

    drawRoadV(
        2050,
        100,
        2200
    );


    /*
        Bridges
    */

    drawBridgeH(
        850,
        920,
        150
    );

    drawBridgeH(
        2140,
        920,
        160
    );

    drawBridgeV(
        760,
        1480,
        150
    );

    drawBridgeV(
        2050,
        650,
        150
    );


    /*
        Fields
    */

    drawField(
        1030,
        760,
        210,
        130
    );

    drawField(
        1030,
        930,
        210,
        130
    );

    drawField(
        1010,
        1770,
        230,
        140
    );

    drawField(
        1010,
        1940,
        230,
        140
    );


    /*
        Buildings
    */

    drawBuilding(
        1110,
        680,
        120,
        80,
        "#6d9c55"
    );

    drawBuilding(
        1710,
        720,
        120,
        80,
        "#5e8db0"
    );

    drawBuilding(
        460,
        1000,
        120,
        85,
        "#d38b52"
    );

    drawBuilding(
        2240,
        1020,
        130,
        85,
        "#817b72"
    );

    drawBuilding(
        240,
        1720,
        140,
        90,
        "#c78c4f"
    );

    drawBuilding(
        1740,
        1730,
        150,
        90,
        "#df8d5b"
    );


    /*
        Docks
    */

    drawDock(
        380,
        740
    );

    drawDock(
        540,
        1370,
        true
    );

    drawDock(
        2270,
        720,
        true
    );

    drawDock(
        1900,
        1380
    );


    /*
        Cars
    */

    drawCar(
        650,
        920,
        "#e74c3c"
    );

    drawCar(
        980,
        920,
        "#f1c40f"
    );

    drawCar(
        1540,
        1430,
        "#3498db"
    );

    drawCar(
        1860,
        1430,
        "#e74c3c"
    );

    drawCar(
        2050,
        800,
        "#f1c40f"
    );


    /*
        Small plaza decorations
    */

    for (
        let i = 0;
        i < 24;
        i++
    ) {

        const angle =
            i / 24 *
            Math.PI * 2;

        const x =
            MAP_CENTER_X +
            Math.cos(angle) *
            210;

        const y =
            1080 +
            Math.sin(angle) *
            160;

        circle(
            x,
            y,
            5,
            i % 2
                ? "#ef6b66"
                : "#f4d35e"
        );
    }


    /*
        Central hall
    */

    drawCentralHall();
}


/* =====================================================
   MAP DRAW
===================================================== */

let mapNatureReady = false;

function drawMap() {

    /*
        Ocean
    */

    drawWater();


    /*
        Islands
    */

    islands.forEach(
        drawIsland
    );


    /*
        Nature
        Generated once
    */

    if (!mapNatureReady) {

        /*
            Nature is drawn
            into a temporary
            offscreen canvas.
        */

        createNatureLayer();

        mapNatureReady = true;
    }


    if (natureCanvas) {

        ctx.drawImage(
            natureCanvas,
            0,
            0
        );
    }


    /*
        Roads and buildings
    */

    drawMapObjects();
}


/* =====================================================
   OFFSCREEN NATURE LAYER
===================================================== */

let natureCanvas = null;
let natureCtx = null;


function createNatureLayer() {

    natureCanvas =
        document.createElement(
            "canvas"
        );

    natureCanvas.width =
        WORLD_WIDTH;

    natureCanvas.height =
        WORLD_HEIGHT;

    natureCtx =
        natureCanvas.getContext(
            "2d"
        );


    /*
        Temporarily redirect
        drawing context.
    */

    const originalCtx =
        window.ctx;

    window.ctx =
        natureCtx;


    /*
        Save global context
        reference for helpers.
    */

    const oldContext =
        ctx;

    /*
        We cannot actually
        replace const ctx,
        therefore use a separate
        direct nature renderer.
    */

    drawNatureDirect();


    window.ctx =
        originalCtx;
}


function drawNatureDirect() {

    const oldFill =
        ctx.fillStyle;


    /*
        Instead of using the
        normal ctx reference,
        use natureCtx.
    */

    const nctx =
        natureCtx;


    function nCircle(
        x,
        y,
        r,
        color
    ) {

        nctx.fillStyle =
            color;

        nctx.beginPath();

        nctx.arc(
            x,
            y,
            r,
            0,
            Math.PI * 2
        );

        nctx.fill();
    }


    function nRect(
        x,
        y,
        w,
        h,
        color
    ) {

        nctx.fillStyle =
            color;

        nctx.fillRect(
            x,
            y,
            w,
            h
        );
    }


    for (
        let i = 0;
        i < islands.length;
        i++
    ) {

        const island =
            islands[i];

        const count =
            Math.floor(
                island.w *
                island.h /
                15000
            );


        for (
            let n = 0;
            n < count;
            n++
        ) {

            const x =
                island.x +
                25 +
                randomHash(
                    n,
                    i,
                    500
                ) *
                (island.w - 50);

            const y =
                island.y +
                25 +
                randomHash(
                    n,
                    i,
                    900
                ) *
                (island.h - 50);


            if (
                island.type === "desert"
            ) {

                if (
                    randomHash(
                        n,
                        i,
                        1000
                    ) > .45
                ) {

                    nRect(
                        x - 4,
                        y - 18,
                        8,
                        30,
                        "#4d9c4d"
                    );

                    nRect(
                        x - 13,
                        y - 8,
                        9,
                        6,
                        "#4d9c4d"
                    );
                }

            } else if (
                island.type === "snow"
            ) {

                nRect(
                    x - 3,
                    y,
                    6,
                    17,
                    "#79563b"
                );

                nCircle(
                    x,
                    y - 6,
                    13,
                    "#427c57"
                );

                nCircle(
                    x,
                    y - 15,
                    9,
                    "#4c8c61"
                );

                nCircle(
                    x,
                    y - 22,
                    5,
                    "#5c9a70"
                );

            } else if (
                island.type === "rock"
            ) {

                nCircle(
                    x,
                    y,
                    13,
                    C.stoneDark
                );

            } else {

                /*
                    Tree
                */

                nRect(
                    x - 4,
                    y + 2,
                    8,
                    18,
                    "#75492d"
                );

                nCircle(
                    x,
                    y - 5,
                    15,
                    "#347346"
                );

                nCircle(
                    x - 9,
                    y + 2,
                    11,
                    "#347346"
                );

                nCircle(
                    x + 9,
                    y + 2,
                    11,
                    "#438b50"
                );

                nCircle(
                    x,
                    y - 11,
                    9,
                    "#5ca75b"
                );
            }
        }
    }
}


/* =====================================================
   PLAYER
===================================================== */

function randomPlayerColor() {

    const colors = [

        "#4DA6FF",
        "#FF5C5C",
        "#FFD34D",
        "#62D66F",
        "#B66DFF",
        "#FF7AC8",
        "#5DE0D0",
        "#FF914D"

    ];

    return colors[
        Math.floor(
            Math.random() *
            colors.length
        )
    ];
}


const player = {

    x: MAP_CENTER_X,
    y: 1080,

    width: 32,
    height: 46,

    radius: 18,

    speed: 230,

    color:
        randomPlayerColor(),

    moving: false,

    direction: "down",

    animationTime: 0
};


/* =====================================================
   CAMERA
===================================================== */

const camera = {

    zoom: 1,

    minZoom: .55,

    maxZoom: 3.5
};


function setZoom(value) {

    camera.zoom =
        Math.max(
            camera.minZoom,
            Math.min(
                camera.maxZoom,
                value
            )
        );
}


/* =====================================================
   KEYBOARD
===================================================== */

const keys = {};

window.addEventListener(
    "keydown",
    event => {

        keys[
            event.key.toLowerCase()
        ] = true;
    }
);


window.addEventListener(
    "keyup",
    event => {

        keys[
            event.key.toLowerCase()
        ] = false;
    }
);


/* =====================================================
   JOYSTICK
===================================================== */

const joystick =
    document.getElementById(
        "joystick"
    );

const joystickKnob =
    document.getElementById(
        "joystickKnob"
    );


let joystickActive = false;
let joystickPointer = null;

let joystickX = 0;
let joystickY = 0;

const JOYSTICK_RADIUS = 35;


function updateJoystick(
    clientX,
    clientY
) {

    const rect =
        joystick.getBoundingClientRect();

    const centerX =
        rect.left +
        rect.width / 2;

    const centerY =
        rect.top +
        rect.height / 2;

    let dx =
        clientX -
        centerX;

    let dy =
        clientY -
        centerY;

    const distance =
        Math.hypot(
            dx,
            dy
        );


    if (
        distance >
        JOYSTICK_RADIUS
    ) {

        dx =
            dx /
            distance *
            JOYSTICK_RADIUS;

        dy =
            dy /
            distance *
            JOYSTICK_RADIUS;
    }


    joystickX =
        dx /
        JOYSTICK_RADIUS;

    joystickY =
        dy /
        JOYSTICK_RADIUS;


    joystickKnob.style.transform =
        `translate(${dx}px,${dy}px)`;
}


function resetJoystick() {

    joystickActive = false;
    joystickPointer = null;

    joystickX = 0;
    joystickY = 0;

    joystickKnob.style.transform =
        "translate(0,0)";
}


joystick.addEventListener(
    "pointerdown",
    event => {

        event.preventDefault();

        joystickActive = true;

        joystickPointer =
            event.pointerId;

        joystick.setPointerCapture(
            event.pointerId
        );

        updateJoystick(
            event.clientX,
            event.clientY
        );
    }
);


joystick.addEventListener(
    "pointermove",
    event => {

        if (!joystickActive)
            return;

        if (
            event.pointerId !==
            joystickPointer
        )
            return;

        updateJoystick(
            event.clientX,
            event.clientY
        );
    }
);


joystick.addEventListener(
    "pointerup",
    resetJoystick
);

joystick.addEventListener(
    "pointercancel",
    resetJoystick
);


/* =====================================================
   ZOOM BUTTONS
===================================================== */

document
    .getElementById("zoomIn")
    .addEventListener(
        "pointerdown",
        () => {

            setZoom(
                camera.zoom + .1
            );
        }
    );


document
    .getElementById("zoomOut")
    .addEventListener(
        "pointerdown",
        () => {

            setZoom(
                camera.zoom - .1
            );
        }
    );


/* =====================================================
   MOUSE WHEEL ZOOM
===================================================== */

canvas.addEventListener(
    "wheel",
    event => {

        event.preventDefault();

        setZoom(
            camera.zoom +
            (
                event.deltaY > 0
                    ? -.1
                    : .1
            )
        );
    },
    {
        passive: false
    }
);


/* =====================================================
   PINCH ZOOM
===================================================== */

const touches =
    new Map();

let pinchDistance = null;
let pinchZoom = 1;


canvas.addEventListener(
    "pointerdown",
    event => {

        if (
            event.pointerType !==
            "touch"
        )
            return;

        touches.set(
            event.pointerId,
            {
                x:
                    event.clientX,

                y:
                    event.clientY
            }
        );


        if (
            touches.size === 2
        ) {

            const values =
                [...touches.values()];

            pinchDistance =
                Math.hypot(
                    values[0].x -
                    values[1].x,

                    values[0].y -
                    values[1].y
                );

            pinchZoom =
                camera.zoom;
        }
    }
);


canvas.addEventListener(
    "pointermove",
    event => {

        if (
            event.pointerType !==
            "touch"
        )
            return;

        if (
            !touches.has(
                event.pointerId
            )
        )
            return;


        touches.set(
            event.pointerId,
            {
                x:
                    event.clientX,

                y:
                    event.clientY
            }
        );


        if (
            touches.size === 2 &&
            pinchDistance
        ) {

            const values =
                [...touches.values()];

            const distance =
                Math.hypot(
                    values[0].x -
                    values[1].x,

                    values[0].y -
                    values[1].y
                );


            setZoom(
                pinchZoom *
                distance /
                pinchDistance
            );
        }
    }
);


function removeTouch(event) {

    touches.delete(
        event.pointerId
    );

    if (
        touches.size < 2
    ) {

        pinchDistance =
            null;
    }
}


canvas.addEventListener(
    "pointerup",
    removeTouch
);

canvas.addEventListener(
    "pointercancel",
    removeTouch
);


/* =====================================================
   PLAYER BOUNDARY
===================================================== */

function keepPlayerInsideMap() {

    const dx =
        player.x -
        MAP_CENTER_X;

    const dy =
        player.y -
        MAP_CENTER_Y;

    const value =
        (
            dx * dx
        ) /
        (
            MAP_RADIUS_X *
            MAP_RADIUS_X
        )
        +
        (
            dy * dy
        ) /
        (
            MAP_RADIUS_Y *
            MAP_RADIUS_Y
        );


    if (value > 1) {

        const scale =
            1 /
            Math.sqrt(value);

        player.x =
            MAP_CENTER_X +
            dx * scale;

        player.y =
            MAP_CENTER_Y +
            dy * scale;
    }
}


/* =====================================================
   UPDATE
===================================================== */

let lastTime =
    performance.now();


function update(time) {

    const delta =
        Math.min(
            (
                time -
                lastTime
            ) / 1000,

            .05
        );


    lastTime = time;

    player.animationTime +=
        delta;


    let moveX = 0;
    let moveY = 0;


    /*
        Keyboard
    */

    if (
        keys["w"] ||
        keys["arrowup"]
    ) {

        moveY--;
    }


    if (
        keys["s"] ||
        keys["arrowdown"]
    ) {

        moveY++;
    }


    if (
        keys["a"] ||
        keys["arrowleft"]
    ) {

        moveX--;
    }


    if (
        keys["d"] ||
        keys["arrowright"]
    ) {

        moveX++;
    }


    /*
        Joystick
    */

    if (
        Math.abs(joystickX) > .05 ||
        Math.abs(joystickY) > .05
    ) {

        moveX =
            joystickX;

        moveY =
            joystickY;
    }


    /*
        Normalize
    */

    const length =
        Math.hypot(
            moveX,
            moveY
        );


    if (
        length > 1
    ) {

        moveX /=
            length;

        moveY /=
            length;
    }


    player.moving =
        Math.abs(moveX) > .05 ||
        Math.abs(moveY) > .05;


    /*
        Direction
    */

    if (
        player.moving
    ) {

        if (
            Math.abs(moveX) >
            Math.abs(moveY)
        ) {

            player.direction =
                moveX > 0
                    ? "right"
                    : "left";

        } else {

            player.direction =
                moveY > 0
                    ? "down"
                    : "up";
        }
    }


    /*
        Move
    */

    player.x +=
        moveX *
        player.speed *
        delta;

    player.y +=
        moveY *
        player.speed *
        delta;


    keepPlayerInsideMap();
}


/* =====================================================
   DRAW PLAYER
===================================================== */

function drawPlayer() {

    const screenX =
        width / 2;

    const screenY =
        height / 2;


    const scale =
        camera.zoom;


    let breathing = 0;

    if (
        !player.moving
    ) {

        breathing =
            Math.sin(
                player.animationTime * 3
            ) *
            1.2;
    }


    const cx =
        screenX;

    const cy =
        screenY -
        breathing;


    /*
        Shadow
    */

    ctx.save();

    ctx.fillStyle =
        "rgba(0,0,0,.30)";

    ctx.beginPath();

    ctx.ellipse(
        cx,
        screenY +
        22 * scale,

        15 * scale,
        6 * scale,

        0,
        0,
        Math.PI * 2
    );

    ctx.fill();


    /*
        Walking animation
    */

    let leftRotation = 0;
    let rightRotation = 0;

    if (
        player.moving
    ) {

        leftRotation =
            Math.sin(
                player.animationTime * 10
            ) *
            .45;

        rightRotation =
            Math.sin(
                player.animationTime * 10 +
                Math.PI
            ) *
            .45;
    }


    /*
        Legs
    */

    const legDistance =
        10 * scale;


    function drawLeg(
        x,
        rotation
    ) {

        ctx.save();

        ctx.translate(
            x,
            cy +
            18 * scale
        );

        ctx.rotate(
            rotation
        );

        ctx.fillStyle =
            "#33383D";

        ctx.strokeStyle =
            "#17191C";

        ctx.lineWidth =
            2 * scale;

        ctx.beginPath();

        ctx.arc(
            0,
            0,
            7 * scale,
            0,
            Math.PI * 2
        );

        ctx.fill();
        ctx.stroke();

        ctx.restore();
    }


    drawLeg(
        cx - legDistance,
        leftRotation
    );

    drawLeg(
        cx + legDistance,
        rightRotation
    );


    /*
        Torso
    */

    const torsoWidth =
        22 * scale;

    const torsoHeight =
        24 * scale;


    ctx.fillStyle =
        player.color;

    ctx.fillRect(
        cx -
        torsoWidth / 2,

        cy -
        2 * scale,

        torsoWidth,
        torsoHeight
    );


    ctx.strokeStyle =
        "rgba(0,0,0,.45)";

    ctx.lineWidth =
        2 * scale;

    ctx.strokeRect(
        cx -
        torsoWidth / 2,

        cy -
        2 * scale,

        torsoWidth,
        torsoHeight
    );


    /*
        Head
    */

    const headRadius =
        13 * scale;


    ctx.beginPath();

    ctx.arc(
        cx,
        cy -
        13 * scale,

        headRadius,

        Math.PI,
        0
    );

    ctx.lineTo(
        cx +
        headRadius,

        cy -
        4 * scale
    );

    ctx.lineTo(
        cx -
        headRadius,

        cy -
        4 * scale
    );

    ctx.closePath();

    ctx.fillStyle =
        player.color;

    ctx.fill();

    ctx.strokeStyle =
        "rgba(0,0,0,.45)";

    ctx.lineWidth =
        2 * scale;

    ctx.stroke();


    /*
        Face
    */

    ctx.fillStyle =
        "#111";

    ctx.beginPath();

    ctx.arc(
        cx -
        5 * scale,

        cy -
        10 * scale,

        1.5 * scale,

        0,
        Math.PI * 2
    );

    ctx.arc(
        cx +
        5 * scale,

        cy -
        10 * scale,

        1.5 * scale,

        0,
        Math.PI * 2
    );

    ctx.fill();


    /*
        Name
    */

    ctx.font =
        `bold ${13 * scale}px Arial`;

    ctx.textAlign =
        "center";

    ctx.fillStyle =
        "#fff";

    ctx.fillText(
        "You",
        cx,
        cy -
        29 * scale
    );


    ctx.restore();
}


/* =====================================================
   DRAW WORLD
===================================================== */

function drawWorld() {

    const visibleWidth =
        width /
        camera.zoom;

    const visibleHeight =
        height /
        camera.zoom;


    const cameraX =
        player.x -
        visibleWidth / 2;

    const cameraY =
        player.y -
        visibleHeight / 2;


    ctx.save();


    ctx.scale(
        camera.zoom,
        camera.zoom
    );

    ctx.translate(
        -cameraX,
        -cameraY
    );


    /*
        Draw vector map
    */

    drawMap();


    ctx.restore();
}


/* =====================================================
   GAME LOOP
===================================================== */

function gameLoop(time) {

    update(time);


    ctx.clearRect(
        0,
        0,
        width,
        height
    );


    drawWorld();

    drawPlayer();


    requestAnimationFrame(
        gameLoop
    );
}


requestAnimationFrame(
    gameLoop
);


/* =====================================================
   MINI HAVEN CHAT
   RENDER SERVER
===================================================== */

const SERVER_URL =
    "https://my-roblox-private-chat.onrender.com";


const chatToggle =
    document.getElementById(
        "chatToggle"
    );

const gameChat =
    document.getElementById(
        "gameChat"
    );

const chatInput =
    document.getElementById(
        "chatInput"
    );

const chatSend =
    document.getElementById(
        "chatSend"
    );

const chatMessages =
    document.getElementById(
        "chatMessages"
    );


let chatUsername = "";

let lastMessageTime = 0;

let loadingChat = false;

const displayedMessages =
    new Set();


/* =====================================================
   USERNAME
===================================================== */

let savedName = null;

try {

    savedName =
        localStorage.getItem(
            "minihaven_username"
        );

} catch (error) {

    console.warn(
        "localStorage unavailable",
        error
    );
}


if (savedName) {

    chatUsername =
        savedName;

} else {

    chatUsername =
        "Player" +
        Math.floor(
            Math.random() *
            9999
        );
}


try {

    localStorage.setItem(
        "minihaven_username",
        chatUsername
    );

} catch (error) {}


/* =====================================================
   OPEN / CLOSE CHAT
===================================================== */

chatToggle.addEventListener(
    "click",
    () => {

        gameChat.classList.toggle(
            "open"
        );


        if (
            gameChat.classList.contains(
                "open"
            )
        ) {

            chatInput.focus();
        }
    }
);


/* =====================================================
   ; = OPEN CHAT
===================================================== */

window.addEventListener(
    "keydown",
    event => {

        if (
            document.activeElement ===
            chatInput
        ) {

            return;
        }


        if (
            event.key === ";"
        ) {

            event.preventDefault();

            gameChat.classList.add(
                "open"
            );

            chatInput.focus();
        }
    }
);


/* =====================================================
   MESSAGE ID
===================================================== */

function messageId(
    message
) {

    return [

        String(
            message.time || ""
        ),

        String(
            message.user || ""
        ),

        String(
            message.msg || ""
        )

    ].join("|||");
}


/* =====================================================
   CHAT NAME COLOR
===================================================== */

function getChatNameColor(
    name
) {

    const colors = [

        "#ff6b8a",
        "#ff9f43",
        "#ffd166",
        "#5ee1a2",
        "#55c7ff",
        "#7c8cff",
        "#b084ff",
        "#ff72d2",
        "#58d5c9",
        "#e989ff"

    ];


    let hash = 0;


    for (
        let i = 0;
        i < name.length;
        i++
    ) {

        hash =
            name.charCodeAt(i) +
            (
                (hash << 5) -
                hash
            );
    }


    return colors[
        Math.abs(hash) %
        colors.length
    ];
}


/* =====================================================
   ADD MESSAGE
===================================================== */

function addChatMessage(
    message
) {

    const id =
        messageId(
            message
        );


    if (
        displayedMessages.has(id)
    ) {

        return;
    }


    displayedMessages.add(id);


    const messageTime =
        Number(
            message.time || 0
        );


    if (
        messageTime >
        lastMessageTime
    ) {

        lastMessageTime =
            messageTime;
    }


    const element =
        document.createElement(
            "div"
        );


    element.className =
        "chatMessage";


    const name =
        document.createElement(
            "span"
        );


    name.className =
        "chatName";


    const displayName =
        message.displayName ||
        message.user ||
        "Unknown";


    name.textContent =
        displayName +
        ":";


    name.style.color =
        getChatNameColor(
            message.user ||
            displayName
        );


    const text =
        document.createElement(
            "span"
        );


    text.textContent =
        message.msg ||
        "";


    element.appendChild(
        name
    );

    element.appendChild(
        text
    );


    chatMessages.appendChild(
        element
    );


    /*
        Maximum 50 visible
        messages
    */

    while (
        chatMessages.children.length >
        50
    ) {

        chatMessages.firstChild.remove();
    }


    chatMessages.scrollTop =
        chatMessages.scrollHeight;
}


/* =====================================================
   LOAD CHAT
===================================================== */

async function loadChatMessages() {

    if (
        loadingChat
    ) {

        return;
    }


    loadingChat = true;


    try {

        const response =
            await fetch(
                SERVER_URL +
                "/messages?since=" +
                encodeURIComponent(
                    lastMessageTime
                ),
                {
                    method: "GET",
                    cache: "no-store"
                }
            );


        if (
            !response.ok
        ) {

            throw new Error(
                "HTTP " +
                response.status
            );
        }


        const data =
            await response.json();


        if (
            !Array.isArray(data)
        ) {

            throw new Error(
                "Invalid response"
            );
        }


        data.sort(
            (a, b) =>
                Number(
                    a.time || 0
                ) -
                Number(
                    b.time || 0
                )
        );


        data.forEach(
            addChatMessage
        );


    } catch (error) {

        console.error(
            "Chat loading error:",
            error
        );

    } finally {

        loadingChat = false;
    }
}


/* =====================================================
   SEND CHAT
===================================================== */

async function sendChatMessage() {

    const msg =
        chatInput.value.trim();


    if (!msg) {

        return;
    }


    try {

        chatSend.disabled =
            true;


        const response =
            await fetch(
                SERVER_URL +
                "/send",
                {
                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            user:
                                chatUsername,

                            displayName:
                                chatUsername,

                            msg:
                                msg,

                            source:
                                "minihaven",

                            private:
                                false
                        })
                }
            );


        if (
            !response.ok
        ) {

            throw new Error(
                "HTTP " +
                response.status
            );
        }


        const result =
            await response.json();


        if (
            result &&
            result.message
        ) {

            addChatMessage(
                result.message
            );
        }


        chatInput.value = "";

        chatInput.focus();


    } catch (error) {

        console.error(
            "Chat send error:",
            error
        );

    } finally {

        chatSend.disabled =
            false;
    }
}


/* =====================================================
   ENTER SEND
===================================================== */

chatInput.addEventListener(
    "keydown",
    event => {

        if (
            event.key ===
            "Enter"
        ) {

            event.preventDefault();

            sendChatMessage();
        }
    }
);


/* =====================================================
   SEND BUTTON
===================================================== */

chatSend.addEventListener(
    "click",
    sendChatMessage
);


/* =====================================================
   START CHAT
===================================================== */

loadChatMessages();


setInterval(
    loadChatMessages,
    500
);
