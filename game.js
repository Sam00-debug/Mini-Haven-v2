/* =====================================================
   MINI HAVEN
   CANVAS MAP + MULTIPLAYER
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
   CLOUDFLARE MULTIPLAYER
===================================================== */

const MULTIPLAYER_URL =
    "wss://mini-haven-cloudfare-server.umeshjamre321.workers.dev/game?room=main";
let socket = null;
let multiplayerConnected = false;

const remotePlayers = new Map();

let multiplayerId =
    crypto.randomUUID
        ? crypto.randomUUID()
        : "player-" +
          Math.random()
              .toString(36)
              .slice(2);

let multiplayerName = "";

try {

    multiplayerName =
        localStorage.getItem(
            "minihaven_username"
        ) || "";

} catch (e) {}

if (!multiplayerName) {

    multiplayerName =
        "Player" +
        Math.floor(
            Math.random() * 9999
        );
}


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

    canvas.width =
        width * dpr;

    canvas.height =
        height * dpr;

    canvas.style.width =
        width + "px";

    canvas.style.height =
        height + "px";

    ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );
}

window.addEventListener(
    "resize",
    resize
);

window.addEventListener(
    "orientationchange",
    () => {
        setTimeout(
            resize,
            100
        );
    }
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

    dark: "#263238",

    arena: "#59636b",
    arenaDark: "#353c42",
    arenaLine: "#9da8ae"
};


/* =====================================================
   SEEDED RANDOM
===================================================== */

function randomHash(
    x,
    y,
    seed = 0
) {

    const n =
        Math.sin(
            x * 127.1 +
            y * 311.7 +
            seed * 74.7
        ) *
        43758.5453;

    return (
        n -
        Math.floor(n)
    );
}


/* =====================================================
   HELPERS
===================================================== */

function rect(
    x,
    y,
    w,
    h,
    color
) {

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
    lineWidth = 2
) {

    ctx.strokeStyle =
        color;

    ctx.lineWidth =
        lineWidth;

    ctx.beginPath();

    ctx.moveTo(
        x1,
        y1
    );

    ctx.lineTo(
        x2,
        y2
    );

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
   3 x 3 ISLAND TABLE
===================================================== */

const ISLAND_W = 860;
const ISLAND_H = 610;

const ISLAND_GAP_X = 100;
const ISLAND_GAP_Y = 100;

const GRID_START_X = 110;
const GRID_START_Y = 120;

const islands = [];

const islandTypes = [

    [
        "forest",
        "grass",
        "snow"
    ],

    [
        "forest",
        "grass",
        "rock"
    ],

    [
        "desert",
        "grass",
        "forest"
    ]
];

for (
    let row = 0;
    row < 3;
    row++
) {

    for (
        let col = 0;
        col < 3;
        col++
    ) {

        islands.push({

            row,
            col,

            x:
                GRID_START_X +
                col *
                (
                    ISLAND_W +
                    ISLAND_GAP_X
                ),

            y:
                GRID_START_Y +
                row *
                (
                    ISLAND_H +
                    ISLAND_GAP_Y
                ),

            w:
                ISLAND_W,

            h:
                ISLAND_H,

            type:
                islandTypes[row][col]
        });
    }
}


/* =====================================================
   DRAW ISLAND
===================================================== */

function drawIsland(
    island,
    index
) {

    let color =
        C.grass;

    if (
        island.type ===
        "forest"
    )
        color =
            C.forest;

    if (
        island.type ===
        "snow"
    )
        color =
            C.snow;

    if (
        island.type ===
        "desert"
    )
        color =
            C.sand;

    if (
        island.type ===
        "rock"
    )
        color =
            C.stone;


    ctx.save();

    ctx.beginPath();

    ctx.roundRect(
        island.x + 12,
        island.y + 12,
        island.w,
        island.h,
        70
    );

    ctx.fillStyle =
        "rgba(0,0,0,.14)";

    ctx.fill();


    ctx.beginPath();

    ctx.roundRect(
        island.x,
        island.y,
        island.w,
        island.h,
        65
    );

    ctx.fillStyle =
        color;

    ctx.fill();

    ctx.restore();


    for (
        let y =
            island.y + 25;
        y <
            island.y +
            island.h -
            20;
        y += 48
    ) {

        for (
            let x =
                island.x + 25;
            x <
                island.x +
                island.w -
                20;
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
                    island.type ===
                    "snow"
                ) {

                    circle(
                        x,
                        y,
                        5,
                        C.snowShadow
                    );

                } else if (
                    island.type ===
                    "desert"
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
   NATURE
===================================================== */

function drawTree(
    x,
    y,
    scale = 1
) {

    ctx.globalAlpha = .22;

    circle(
        x,
        y + 15 * scale,
        13 * scale,
        "#000"
    );

    ctx.globalAlpha = 1;

    rect(
        x - 4 * scale,
        y + 2 * scale,
        8 * scale,
        18 * scale,
        "#75492d"
    );

    circle(
        x,
        y - 5 * scale,
        15 * scale,
        "#347346"
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
   NATURE LAYER
===================================================== */

let natureCanvas = null;

function createNatureLayer() {

    natureCanvas =
        document.createElement(
            "canvas"
        );

    natureCanvas.width =
        WORLD_WIDTH;

    natureCanvas.height =
        WORLD_HEIGHT;

    const nctx =
        natureCanvas.getContext(
            "2d"
        );

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


    islands.forEach(
        (island, i) => {

            const count =
                Math.floor(
                    island.w *
                    island.h /
                    18000
                );

            for (
                let n = 0;
                n < count;
                n++
            ) {

                const x =
                    island.x +
                    35 +
                    randomHash(
                        n,
                        i,
                        500
                    ) *
                    (
                        island.w -
                        70
                    );

                const y =
                    island.y +
                    35 +
                    randomHash(
                        n,
                        i,
                        900
                    ) *
                    (
                        island.h -
                        70
                    );


                if (
                    island.type ===
                    "desert"
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
                    island.type ===
                    "snow"
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
                    island.type ===
                    "rock"
                ) {

                    nCircle(
                        x,
                        y,
                        13,
                        C.stoneDark
                    );

                } else {

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
    );
}


/* =====================================================
   ROADS
   3X WIDER
===================================================== */

const ROAD_WIDTH = 108;
const ROAD_BORDER = 10;


function drawRoadH(
    x,
    y,
    w
) {

    rect(
        x,
        y - ROAD_WIDTH / 2,
        w,
        ROAD_WIDTH,
        C.roadDark
    );

    rect(
        x,
        y -
            ROAD_WIDTH / 2 +
            ROAD_BORDER,
        w,
        ROAD_WIDTH -
            ROAD_BORDER * 2,
        C.road
    );


    for (
        let p = x + 15;
        p < x + w;
        p += 70
    ) {

        rect(
            p,
            y - 3,
            40,
            6,
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
        x - ROAD_WIDTH / 2,
        y,
        ROAD_WIDTH,
        h,
        C.roadDark
    );

    rect(
        x -
            ROAD_WIDTH / 2 +
            ROAD_BORDER,
        y,
        ROAD_WIDTH -
            ROAD_BORDER * 2,
        h,
        C.road
    );


    for (
        let p = y + 15;
        p < y + h;
        p += 70
    ) {

        rect(
            x - 3,
            p,
            6,
            40,
            C.roadLine
        );
    }
}


/* =====================================================
   GRID ROAD NETWORK
===================================================== */

function drawGridRoads() {

    /* horizontal roads */

    const rowCenters =
        islands
            .filter(
                i => i.col === 1
            )
            .map(
                i =>
                    i.y +
                    i.h / 2
            );

    rowCenters.forEach(
        y => {

            drawRoadH(
                0,
                y,
                WORLD_WIDTH
            );
        }
    );


    /* vertical roads */

    const colCenters =
        islands
            .filter(
                i => i.row === 1
            )
            .map(
                i =>
                    i.x +
                    i.w / 2
            );

    colCenters.forEach(
        x => {

            drawRoadV(
                x,
                0,
                WORLD_HEIGHT
            );
        }
    );


    /* connecting roads between island columns */

    for (
        let row = 0;
        row < 3;
        row++
    ) {

        const left =
            islands.find(
                i =>
                    i.row === row &&
                    i.col === 0
            );

        const middle =
            islands.find(
                i =>
                    i.row === row &&
                    i.col === 1
            );

        const right =
            islands.find(
                i =>
                    i.row === row &&
                    i.col === 2
            );

        const y =
            left.y +
            left.h / 2;

        drawRoadH(
            left.x +
                left.w -
                10,
            y,
            middle.x -
                (
                    left.x +
                    left.w
                ) +
                20
        );

        drawRoadH(
            middle.x +
                middle.w -
                10,
            y,
            right.x -
                (
                    middle.x +
                    middle.w
                ) +
                20
        );
    }


    /* connecting roads between rows */

    for (
        let col = 0;
        col < 3;
        col++
    ) {

        const top =
            islands.find(
                i =>
                    i.row === 0 &&
                    i.col === col
            );

        const middle =
            islands.find(
                i =>
                    i.row === 1 &&
                    i.col === col
            );

        const bottom =
            islands.find(
                i =>
                    i.row === 2 &&
                    i.col === col
            );

        const x =
            top.x +
            top.w / 2;

        drawRoadV(
            x,
            top.y +
                top.h -
                10,
            middle.y -
                (
                    top.y +
                    top.h
                ) +
                20
        );

        drawRoadV(
            x,
            middle.y +
                middle.h -
                10,
            bottom.y -
                (
                    middle.y +
                    middle.h
                ) +
                20
        );
    }
}





/* =====================================================
   FOUNTAIN
===================================================== */

const fountain = {
    x: MAP_CENTER_X,
    y: MAP_CENTER_Y
};


function drawFountain() {

    const x =
        fountain.x;

    const y =
        fountain.y;


    /* circular road around fountain */

    ctx.fillStyle =
        C.roadDark;

    ctx.beginPath();

    ctx.arc(
        x,
        y,
        230,
        0,
        Math.PI * 2
    );

    ctx.fill();


    ctx.fillStyle =
        C.road;

    ctx.beginPath();

    ctx.arc(
        x,
        y,
        205,
        0,
        Math.PI * 2
    );

    ctx.fill();


    /* inner grass */

    ctx.fillStyle =
        "#72b95e";

    ctx.beginPath();

    ctx.arc(
        x,
        y,
        135,
        0,
        Math.PI * 2
    );

    ctx.fill();


    /* fountain basin */

    ctx.fillStyle =
        "#d8dde0";

    ctx.beginPath();

    ctx.arc(
        x,
        y,
        70,
        0,
        Math.PI * 2
    );

    ctx.fill();


    ctx.fillStyle =
        "#5bb9d0";

    ctx.beginPath();

    ctx.arc(
        x,
        y,
        58,
        0,
        Math.PI * 2
    );

    ctx.fill();


    /* fountain center */

    rect(
        x - 10,
        y - 50,
        20,
        50,
        "#c5cacc"
    );

    circle(
        x,
        y - 58,
        13,
        "#eef2f3"
    );


    /* water spray */

    ctx.strokeStyle =
        "#dff8ff";

    ctx.lineWidth = 4;

    ctx.beginPath();

    ctx.arc(
        x,
        y - 45,
        28,
        Math.PI,
        Math.PI * 2
    );

    ctx.stroke();
}


/* =====================================================
   MAP OBJECTS
===================================================== */

function drawMapObjects() {

    drawGridRoads();

    drawArenas();

    drawFountain();
}


/* =====================================================
   COLLISION AREAS
===================================================== */

function pointInsideIsland(
    x,
    y,
    island
) {

    return (
        x >= island.x &&
        x <=
            island.x +
            island.w &&
        y >= island.y &&
        y <=
            island.y +
            island.h
    );
}


function pointInsideArena(
    x,
    y,
    arena
) {

    return (
        x >= arena.x &&
        x <=
            arena.x +
            arena.w &&
        y >= arena.y &&
        y <=
            arena.y +
            arena.h
    );
}


function isWalkable(
    x,
    y
) {

    /* water = blocked */

    let insideLand =
        false;

    for (
        const island of islands
    ) {

        if (
            pointInsideIsland(
                x,
                y,
                island
            )
        ) {

            insideLand = true;
            break;
        }
    }


    if (!insideLand) {

        return false;
    }




function movePlayerWithCollision(
    dx,
    dy
) {

    const nextX =
        player.x +
        dx;

    const nextY =
        player.y +
        dy;


    if (
        isWalkable(
            nextX,
            player.y
        )
    ) {

        player.x =
            nextX;
    }


    if (
        isWalkable(
            player.x,
            nextY
        )
    ) {

        player.y =
            nextY;
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


const centerIsland =
    islands.find(
        island =>
            island.row === 1 &&
            island.col === 1
    );


const player = {

    x:
        centerIsland.x +
        centerIsland.w / 2,

    y:
        centerIsland.y +
        centerIsland.h / 2,

    width: 32,
    height: 46,

    radius: 18,

    speed: 230,

    color:
        randomPlayerColor(),

    moving: false,

    direction:
        "down",

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


function setZoom(
    value
) {

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
   MOBILE DETECTION
===================================================== */

const isDesktop =
    window.matchMedia(
        "(hover: hover) and (pointer: fine)"
    ).matches;


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


if (
    isDesktop
) {

    if (joystick) {

        joystick.style.display =
            "none";
    }

} else if (
    joystick &&
    joystickKnob
) {

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

        joystickPointer =
            null;

        joystickX = 0;
        joystickY = 0;

        joystickKnob.style.transform =
            "translate(0,0)";
    }


    joystick.addEventListener(
        "pointerdown",
        event => {

            event.preventDefault();

            joystickActive =
                true;

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

            if (
                !joystickActive
            )
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
}


/* =====================================================
   ZOOM BUTTONS
===================================================== */

const zoomIn =
    document.getElementById(
        "zoomIn"
    );

const zoomOut =
    document.getElementById(
        "zoomOut"
    );

if (zoomIn) {

    zoomIn.addEventListener(
        "pointerdown",
        () => {

            setZoom(
                camera.zoom +
                .1
            );
        }
    );
}

if (zoomOut) {

    zoomOut.addEventListener(
        "pointerdown",
        () => {

            setZoom(
                camera.zoom -
                .1
            );
        }
    );
}


/* =====================================================
   MOUSE WHEEL
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
                [
                    ...touches.values()
                ];

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
                [
                    ...touches.values()
                ];

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


function removeTouch(
    event
) {

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
   PLAYER MOVEMENT
===================================================== */

function getMovement() {

    let moveX = 0;
    let moveY = 0;


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


    if (
        Math.abs(
            joystickX
        ) > .05 ||
        Math.abs(
            joystickY
        ) > .05
    ) {

        moveX =
            joystickX;

        moveY =
            joystickY;
    }


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

    return {
        x: moveX,
        y: moveY
    };
}


/* =====================================================
   DIRECTION
   8 DIRECTIONS
===================================================== */

function getDirection(
    x,
    y
) {

    if (
        Math.abs(x) < .15 &&
        Math.abs(y) < .15
    ) {

        return player.direction;
    }


    const angle =
        Math.atan2(
            y,
            x
        );

    const degrees =
        (
            angle *
            180 /
            Math.PI +
            360
        ) %
        360;


    if (
        degrees >= 337.5 ||
        degrees < 22.5
    )
        return "right";

    if (
        degrees >= 22.5 &&
        degrees < 67.5
    )
        return "down-right";

    if (
        degrees >= 67.5 &&
        degrees < 112.5
    )
        return "down";

    if (
        degrees >= 112.5 &&
        degrees < 157.5
    )
        return "down-left";

    if (
        degrees >= 157.5 &&
        degrees < 202.5
    )
        return "left";

    if (
        degrees >= 202.5 &&
        degrees < 247.5
    )
        return "up-left";

    if (
        degrees >= 247.5 &&
        degrees < 292.5
    )
        return "up";

    return "up-right";
}


/* =====================================================
   UPDATE
===================================================== */

let lastTime =
    performance.now();

function update(
    time
) {

    const delta =
        Math.min(
            (
                time -
                lastTime
            ) / 1000,

            .05
        );

    lastTime =
        time;

    player.animationTime +=
        delta;


    const movement =
        getMovement();

    const moveX =
        movement.x;

    const moveY =
        movement.y;


    player.moving =
        Math.abs(moveX) > .05 ||
        Math.abs(moveY) > .05;


    if (
        player.moving
    ) {

        player.direction =
            getDirection(
                moveX,
                moveY
            );
    }


    movePlayerWithCollision(
        moveX *
            player.speed *
            delta,

        moveY *
            player.speed *
            delta
    );


    sendPlayerState();
}


/* =====================================================
   DRAW PLAYER GUN
===================================================== */

function drawGun(
    cx,
    cy,
    scale,
    direction
) {

    let angle = 0;

    if (
        direction ===
        "right" ||
        direction ===
        "up-right" ||
        direction ===
        "down-right"
    ) {

        angle = 0;

    } else if (
        direction ===
        "left" ||
        direction ===
        "up-left" ||
        direction ===
        "down-left"
    ) {

        angle =
            Math.PI;

    } else if (
        direction === "up"
    ) {

        angle =
            -Math.PI / 2;

    } else {

        angle =
            Math.PI / 2;
    }


    ctx.save();

    ctx.translate(
        cx,
        cy
    );

    ctx.rotate(
        angle
    );


    /* shoulder mount */

    roundRect(
        5 * scale,
        -6 * scale,
        11 * scale,
        12 * scale,
        3 * scale,
        "#33383d"
    );


    /* weapon body */

    roundRect(
        8 * scale,
        -5 * scale,
        23 * scale,
        10 * scale,
        3 * scale,
        "#24282c"
    );


    /* barrel */

    rect(
        27 * scale,
        -2 * scale,
        17 * scale,
        4 * scale,
        "#111417"
    );


    /* small top sight */

    rect(
        16 * scale,
        -9 * scale,
        7 * scale,
        4 * scale,
        "#111417"
    );


    /* magazine */

    rect(
        13 * scale,
        5 * scale,
        7 * scale,
        10 * scale,
        "#181b1e"
    );


    ctx.restore();
}


/* =====================================================
   PLAYER EYE
===================================================== */

function drawEye(
    x,
    y,
    scale,
    visible
) {

    if (!visible)
        return;


    circle(
        x,
        y,
        4.2 * scale,
        "#ffffff"
    );

    circle(
        x,
        y,
        1.7 * scale,
        "#111111"
    );
}


/* =====================================================
   DRAW PLAYER
===================================================== */

function drawPlayerSprite(
    cx,
    cy,
    scale,
    p
) {

    const direction =
        p.direction ||
        "down";

    let breathing = 0;

    if (
        !p.moving
    ) {

        breathing =
            Math.sin(
                p.animationTime *
                3
            ) *
            1.2;
    }


    cy -=
        breathing;


    /* shadow */

    ctx.fillStyle =
        "rgba(0,0,0,.30)";

    ctx.beginPath();

    ctx.ellipse(
        cx,
        cy +
            22 *
            scale,
        15 *
            scale,
        6 *
            scale,
        0,
        0,
        Math.PI * 2
    );

    ctx.fill();


    /* legs */

    let legA = 0;
    let legB = 0;

    if (
        p.moving
    ) {

        legA =
            Math.sin(
                p.animationTime *
                10
            ) *
            .45;

        legB =
            Math.sin(
                p.animationTime *
                10 +
                Math.PI
            ) *
            .45;
    }


    function drawLeg(
        x,
        rotation
    ) {

        ctx.save();

        ctx.translate(
            x,
            cy +
                18 *
                scale
        );

        ctx.rotate(
            rotation
        );

        ctx.fillStyle =
            "#33383D";

        ctx.strokeStyle =
            "#17191C";

        ctx.lineWidth =
            2 *
            scale;

        ctx.beginPath();

        ctx.arc(
            0,
            0,
            7 *
                scale,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.stroke();

        ctx.restore();
    }


    const legDistance =
        10 *
        scale;

    drawLeg(
        cx -
            legDistance,
        legA
    );

    drawLeg(
        cx +
            legDistance,
        legB
    );


    /* torso */

    const torsoWidth =
        22 *
        scale;

    const torsoHeight =
        24 *
        scale;

    ctx.fillStyle =
        p.color ||
        player.color;

    ctx.fillRect(
        cx -
            torsoWidth /
            2,

        cy -
            2 *
            scale,

        torsoWidth,
        torsoHeight
    );

    ctx.strokeStyle =
        "rgba(0,0,0,.45)";

    ctx.lineWidth =
        2 *
        scale;

    ctx.strokeRect(
        cx -
            torsoWidth /
            2,

        cy -
            2 *
            scale,

        torsoWidth,
        torsoHeight
    );


    /* head */

    const headRadius =
        13 *
        scale;

    ctx.beginPath();

    ctx.arc(
        cx,
        cy -
            13 *
            scale,
        headRadius,
        Math.PI,
        0
    );

    ctx.lineTo(
        cx +
            headRadius,
        cy -
            4 *
            scale
    );

    ctx.lineTo(
        cx -
            headRadius,
        cy -
            4 *
            scale
    );

    ctx.closePath();

    ctx.fillStyle =
        p.color ||
        player.color;

    ctx.fill();

    ctx.strokeStyle =
        "rgba(0,0,0,.45)";

    ctx.lineWidth =
        2 *
        scale;

    ctx.stroke();


    /* =================================================
       EYES

       Right movement:
       hide left eye

       Left movement:
       hide right eye

       Diagonal directions:
       corresponding side eye hidden
    ================================================= */

    let leftEyeVisible = true;
    let rightEyeVisible = true;

    if (
        direction === "right" ||
        direction === "up-right" ||
        direction === "down-right"
    ) {

        leftEyeVisible = false;

    } else if (
        direction === "left" ||
        direction === "up-left" ||
        direction === "down-left"
    ) {

        rightEyeVisible = false;
    }


    drawEye(
        cx -
            5 *
            scale,
        cy -
            10 *
            scale,
        scale,
        leftEyeVisible
    );

    drawEye(
        cx +
            5 *
            scale,
        cy -
            10 *
            scale,
        scale,
        rightEyeVisible
    );


    /* shoulder weapon */

    drawGun(
        cx,
        cy,
        scale,
        direction
    );


    /* name */

    ctx.font =
        `bold ${
            13 *
            scale
        }px Arial`;

    ctx.textAlign =
        "center";

    ctx.fillStyle =
        "#fff";

    ctx.fillText(
        p.name ||
            "Player",
        cx,
        cy -
            29 *
            scale
    );
}


function drawPlayer() {

    drawPlayerSprite(
        width / 2,
        height / 2,
        camera.zoom,
        {
            ...player,
            name:
                "You"
        }
    );
}


/* =====================================================
   REMOTE PLAYERS
===================================================== */

function drawRemotePlayers() {

    remotePlayers.forEach(
        remote => {

            const visibleWidth =
                width /
                camera.zoom;

            const visibleHeight =
                height /
                camera.zoom;

            const cameraX =
                player.x -
                visibleWidth /
                2;

            const cameraY =
                player.y -
                visibleHeight /
                2;

            const screenX =
                (
                    remote.x -
                    cameraX
                ) *
                camera.zoom;

            const screenY =
                (
                    remote.y -
                    cameraY
                ) *
                camera.zoom;


            if (
                screenX <
                    -100 ||
                screenX >
                    width +
                    100 ||
                screenY <
                    -100 ||
                screenY >
                    height +
                    100
            ) {

                return;
            }


            drawPlayerSprite(
                screenX,
                screenY,
                camera.zoom,
                remote
            );
        }
    );
}


/* =====================================================
   WORLD DRAW
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
        visibleWidth /
        2;

    const cameraY =
        player.y -
        visibleHeight /
        2;


    ctx.save();

    ctx.scale(
        camera.zoom,
        camera.zoom
    );

    ctx.translate(
        -cameraX,
        -cameraY
    );


    drawWater();


    islands.forEach(
        drawIsland
    );


    if (
        !natureCanvas
    ) {

        createNatureLayer();
    }


    ctx.drawImage(
        natureCanvas,
        0,
        0
    );


    drawMapObjects();


    ctx.restore();


    drawRemotePlayers();

    drawPlayer();
}


/* =====================================================
   MULTIPLAYER
===================================================== */

function connectMultiplayer() {

    try {

        socket =
            new WebSocket(
                MULTIPLAYER_URL
            );

    } catch (error) {

        console.error(
            "WebSocket creation failed:",
            error
        );

        return;
    }


    socket.addEventListener(
        "open",
        () => {

            multiplayerConnected =
                true;

            console.log(
                "Mini Haven multiplayer connected"
            );


            socket.send(
                JSON.stringify({

                    type:
                        "join",

                    id:
                        multiplayerId,

                    name:
                        multiplayerName,

                    x:
                        player.x,

                    y:
                        player.y,

                    color:
                        player.color,

                    direction:
                        player.direction,

                    moving:
                        false
                })
            );
        }
    );


    socket.addEventListener(
        "message",
        event => {

            try {

                const data =
                    JSON.parse(
                        event.data
                    );

                handleMultiplayerMessage(
                    data
                );

            } catch (error) {

                console.warn(
                    "Invalid multiplayer message",
                    error
                );
            }
        }
    );


    socket.addEventListener(
        "close",
        () => {

            multiplayerConnected =
                false;

            console.log(
                "Mini Haven multiplayer disconnected"
            );

            setTimeout(
                connectMultiplayer,
                3000
            );
        }
    );


    socket.addEventListener(
        "error",
        error => {

            multiplayerConnected =
                false;

            console.error(
                "Multiplayer WebSocket error:",
                error
            );
        }
    );
}


function handleMultiplayerMessage(
    data
) {

    if (!data)
        return;

if (
    data.type === "welcome"
) {

    if (data.id) {

        multiplayerId =
            data.id;

        console.log(
            "Server player ID:",
            multiplayerId
        );
    }

    return;
}
    /* server may send an array */

    if (
        Array.isArray(data)
    ) {

        data.forEach(
            updateRemotePlayer
        );

        return;
    }


    if (
        data.type ===
        "players"
    ) {

        if (
            Array.isArray(
                data.players
            )
        ) {

            data.players.forEach(
                updateRemotePlayer
            );
        }

        return;
    }


    if (
        data.type ===
        "player"
    ) {

        updateRemotePlayer(
            data.player ||
            data
        );

        return;
    }


    if (
        data.type ===
        "leave"
    ) {

        if (
            data.id
        ) {

            remotePlayers.delete(
                data.id
            );
        }

        return;
    }


    if (
        data.id
    ) {

        updateRemotePlayer(
            data
        );
    }
}


function updateRemotePlayer(
    data
) {

    if (!data)
        return;

    const id =
        data.id ||
        data.playerId;

    if (!id)
        return;

    if (
        id ===
        multiplayerId
    )
        return;


    remotePlayers.set(
        id,
        {

            id,

            x:
                Number(
                    data.x
                ) ||
                0,

            y:
                Number(
                    data.y
                ) ||
                0,

            color:
                data.color ||
                "#4DA6FF",

            name:
                data.name ||
                data.displayName ||
                "Player",

            direction:
                data.direction ||
                "down",

            moving:
                Boolean(
                    data.moving
                ),

            animationTime:
                Number(
                    data.animationTime
                ) ||
                0
        }
    );
}


let lastNetworkSend = 0;

function sendPlayerState() {

    if (
        !socket ||
        socket.readyState !==
        WebSocket.OPEN
    )
        return;


    const now =
        performance.now();

    if (
        now -
        lastNetworkSend <
        50
    )
        return;

    lastNetworkSend =
        now;


    try {

        socket.send(
            JSON.stringify({

                type:
                    "state",

                id:
                    multiplayerId,

                name:
                    multiplayerName,

                x:
                    player.x,

                y:
                    player.y,

                color:
                    player.color,

                direction:
                    player.direction,

                moving:
                    player.moving
            })
        );

    } catch (error) {

        console.warn(
            "State send failed:",
            error
        );
    }
}


/* =====================================================
   GAME LOOP
===================================================== */

function gameLoop(
    time
) {

    update(
        time
    );


    ctx.clearRect(
        0,
        0,
        width,
        height
    );


    drawWorld();


    requestAnimationFrame(
        gameLoop
    );
}


/* =====================================================
   START
===================================================== */

requestAnimationFrame(
    gameLoop
);

connectMultiplayer();


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


multiplayerName =
    chatUsername;


/* =====================================================
   CHAT
===================================================== */

if (
    chatToggle &&
    gameChat
) {

    chatToggle.addEventListener(
        "click",
        () => {

            gameChat.classList.toggle(
                "open"
            );

            if (
                gameChat.classList.contains(
                    "open"
                ) &&
                chatInput
            ) {

                chatInput.focus();
            }
        }
    );
}


window.addEventListener(
    "keydown",
    event => {

        if (
            chatInput &&
            document.activeElement ===
            chatInput
        ) {

            return;
        }

        if (
            event.key ===
            ";"
        ) {

            event.preventDefault();

            if (
                gameChat
            ) {

                gameChat.classList.add(
                    "open"
                );
            }

            if (
                chatInput
            ) {

                chatInput.focus();
            }
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
            message.time ||
            ""
        ),

        String(
            message.user ||
            ""
        ),

        String(
            message.msg ||
            ""
        )

    ].join(
        "|||"
    );
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

    if (
        !chatMessages
    )
        return;


    const id =
        messageId(
            message
        );

    if (
        displayedMessages.has(
            id
        )
    ) {

        return;
    }

    displayedMessages.add(
        id
    );


    const messageTime =
        Number(
            message.time ||
            0
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
                    method:
                        "GET",

                    cache:
                        "no-store"
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
            !Array.isArray(
                data
            )
        ) {

            throw new Error(
                "Invalid response"
            );
        }


        data.sort(
            (a, b) =>
                Number(
                    a.time ||
                    0
                ) -
                Number(
                    b.time ||
                    0
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

        loadingChat =
            false;
    }
}


/* =====================================================
   SEND CHAT
===================================================== */

async function sendChatMessage() {

    if (
        !chatInput
    )
        return;


    const msg =
        chatInput.value.trim();

    if (!msg)
        return;


    try {

        if (chatSend) {

            chatSend.disabled =
                true;
        }


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

        if (chatSend) {

            chatSend.disabled =
                false;
        }
    }
}


/* =====================================================
   CHAT ENTER
===================================================== */

if (
    chatInput
) {

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
}


if (
    chatSend
) {

    chatSend.addEventListener(
        "click",
        sendChatMessage
    );
}


/* =====================================================
   START CHAT
===================================================== */

loadChatMessages();

setInterval(
    loadChatMessages,
    500
);


/* =====================================================
   FORCE CHAT BUTTON TOP LEFT
===================================================== */

if (
    chatToggle
) {

    chatToggle.style.position =
        "fixed";

    chatToggle.style.left =
        "15px";

    chatToggle.style.top =
        "15px";

    chatToggle.style.right =
        "auto";

    chatToggle.style.bottom =
        "auto";

    chatToggle.style.zIndex =
        "9999";
}
