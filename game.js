/* =====================================================
   MINI HAVEN
   CANVAS MAP + MULTIPLAYER
   LARGE MAP + ROAD COLLISION + 360° AIM
===================================================== */

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

ctx.imageSmoothingEnabled = true;


/* =====================================================
   SETTINGS
===================================================== */

const WORLD_WIDTH = 5200;
const WORLD_HEIGHT = 4200;

const MAP_CENTER_X = WORLD_WIDTH / 2;
const MAP_CENTER_Y = WORLD_HEIGHT / 2;


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
          Math.random().toString(36).slice(2);

let multiplayerName = "";

try {
    multiplayerName =
        localStorage.getItem("minihaven_username") || "";
} catch (e) {}

if (!multiplayerName) {
    multiplayerName =
        "Player" +
        Math.floor(Math.random() * 9999);
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
    () => {
        setTimeout(resize, 100);
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

function randomHash(x, y, seed = 0) {

    const n =
        Math.sin(
            x * 127.1 +
            y * 311.7 +
            seed * 74.7
        ) * 43758.5453;

    return n - Math.floor(n);
}


/* =====================================================
   DRAW HELPERS
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
    lineWidth = 2
) {

    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;

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

            if (r > 0.55) {

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
   LARGE 3 x 3 ISLAND WORLD
===================================================== */

const ISLAND_W = 1350;
const ISLAND_H = 900;

const ISLAND_GAP_X = 180;
const ISLAND_GAP_Y = 180;

const GRID_START_X = 395;
const GRID_START_Y = 300;

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
   ISLAND DRAW
===================================================== */

function drawIsland(
    island,
    index
) {

    let color = C.grass;

    if (island.type === "forest")
        color = C.forest;

    if (island.type === "snow")
        color = C.snow;

    if (island.type === "desert")
        color = C.sand;

    if (island.type === "rock")
        color = C.stone;


    ctx.save();

    /* island shadow */

    ctx.beginPath();

    ctx.roundRect(
        island.x + 18,
        island.y + 18,
        island.w,
        island.h,
        90
    );

    ctx.fillStyle =
        "rgba(0,0,0,.16)";

    ctx.fill();


    /* island */

    ctx.beginPath();

    ctx.roundRect(
        island.x,
        island.y,
        island.w,
        island.h,
        85
    );

    ctx.fillStyle =
        color;

    ctx.fill();

    ctx.restore();


    /* terrain details */

    for (
        let y =
            island.y + 35;

        y <
            island.y +
            island.h -
            30;

        y += 55
    ) {

        for (
            let x =
                island.x + 35;

            x <
                island.x +
                island.w -
                30;

            x += 60
        ) {

            const r =
                randomHash(
                    x,
                    y,
                    index + 50
                );

            if (r > 0.84) {

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
   NATURE LAYER
===================================================== */

let natureCanvas = null;

function createNatureLayer() {

    natureCanvas =
        document.createElement("canvas");

    natureCanvas.width =
        WORLD_WIDTH;

    natureCanvas.height =
        WORLD_HEIGHT;

    const nctx =
        natureCanvas.getContext("2d");


    function nCircle(
        x,
        y,
        r,
        color
    ) {

        nctx.fillStyle = color;

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

        nctx.fillStyle = color;

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
                    13000
                );


            for (
                let n = 0;
                n < count;
                n++
            ) {

                const x =
                    island.x +
                    45 +
                    randomHash(
                        n,
                        i,
                        500
                    ) *
                    (
                        island.w -
                        90
                    );

                const y =
                    island.y +
                    45 +
                    randomHash(
                        n,
                        i,
                        900
                    ) *
                    (
                        island.h -
                        90
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
                        ) > 0.45
                    ) {

                        nRect(
                            x - 5,
                            y - 22,
                            10,
                            36,
                            "#4d9c4d"
                        );

                        nRect(
                            x - 16,
                            y - 10,
                            11,
                            7,
                            "#4d9c4d"
                        );

                        nRect(
                            x + 5,
                            y - 17,
                            11,
                            7,
                            "#4d9c4d"
                        );
                    }

                } else if (
                    island.type ===
                    "snow"
                ) {

                    nRect(
                        x - 4,
                        y,
                        8,
                        20,
                        "#79563b"
                    );

                    nCircle(
                        x,
                        y - 8,
                        15,
                        "#427c57"
                    );

                    nCircle(
                        x,
                        y - 18,
                        11,
                        "#4c8c61"
                    );

                    nCircle(
                        x,
                        y - 27,
                        6,
                        "#5c9a70"
                    );

                } else if (
                    island.type ===
                    "rock"
                ) {

                    nCircle(
                        x,
                        y,
                        15,
                        C.stoneDark
                    );

                    nCircle(
                        x - 4,
                        y - 5,
                        5,
                        "#b3b7b7"
                    );

                } else {

                    nRect(
                        x - 5,
                        y + 2,
                        10,
                        22,
                        "#75492d"
                    );

                    nCircle(
                        x,
                        y - 7,
                        18,
                        "#347346"
                    );

                    nCircle(
                        x - 11,
                        y + 2,
                        13,
                        "#347346"
                    );

                    nCircle(
                        x + 11,
                        y + 2,
                        13,
                        "#438b50"
                    );

                    nCircle(
                        x,
                        y - 14,
                        11,
                        "#5ca75b"
                    );
                }
            }
        }
    );
}


/* =====================================================
   ROADS
===================================================== */

const ROAD_WIDTH = 145;
const ROAD_BORDER = 12;


/*
    Every road rectangle is stored here.

    This is important because roads are visually
    drawn over water between islands, and therefore
    must be explicitly walkable.
*/

const roadAreas = [];


function addRoadArea(
    x,
    y,
    w,
    h
) {

    roadAreas.push({
        x,
        y,
        w,
        h
    });
}


function drawRoadH(
    x,
    y,
    w
) {

    addRoadArea(
        x,
        y -
            ROAD_WIDTH / 2,
        w,
        ROAD_WIDTH
    );


    rect(
        x,
        y -
            ROAD_WIDTH / 2,
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
        let p = x + 20;
        p < x + w;
        p += 90
    ) {

        rect(
            p,
            y - 4,
            52,
            8,
            C.roadLine
        );
    }
}


function drawRoadV(
    x,
    y,
    h
) {

    addRoadArea(
        x -
            ROAD_WIDTH / 2,
        y,
        ROAD_WIDTH,
        h
    );


    rect(
        x -
            ROAD_WIDTH / 2,
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
        let p = y + 20;
        p < y + h;
        p += 90
    ) {

        rect(
            x - 4,
            p,
            8,
            52,
            C.roadLine
        );
    }
}


/* =====================================================
   GRID ROAD NETWORK
===================================================== */

function buildRoadNetwork() {

    /*
       Clear old collision rectangles.
    */

    roadAreas.length = 0;


    /*
       Horizontal central roads.
    */

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

        const right =
            islands.find(
                i =>
                    i.row === row &&
                    i.col === 2
            );

        const y =
            left.y +
            left.h / 2;


        /*
           Entire row is connected.
        */

        drawRoadH(
            left.x - 40,
            y,
            (
                right.x +
                right.w
            ) -
            (
                left.x - 40
            ) +
            40
        );
    }


    /*
       Vertical roads.
    */

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
            top.y - 40,
            (
                bottom.y +
                bottom.h
            ) -
            (
                top.y - 40
            ) +
            40
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

    const x = fountain.x;
    const y = fountain.y;


    /* circular road */

    ctx.fillStyle =
        C.roadDark;

    ctx.beginPath();

    ctx.arc(
        x,
        y,
        280,
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
        250,
        0,
        Math.PI * 2
    );

    ctx.fill();


    /* grass */

    ctx.fillStyle =
        "#72b95e";

    ctx.beginPath();

    ctx.arc(
        x,
        y,
        160,
        0,
        Math.PI * 2
    );

    ctx.fill();


    /* basin */

    ctx.fillStyle =
        "#d8dde0";

    ctx.beginPath();

    ctx.arc(
        x,
        y,
        82,
        0,
        Math.PI * 2
    );

    ctx.fill();


    /* water */

    ctx.fillStyle =
        "#5bb9d0";

    ctx.beginPath();

    ctx.arc(
        x,
        y,
        68,
        0,
        Math.PI * 2
    );

    ctx.fill();


    /* fountain center */

    rect(
        x - 12,
        y - 58,
        24,
        58,
        "#c5cacc"
    );

    circle(
        x,
        y - 68,
        15,
        "#eef2f3"
    );


    /* water spray */

    ctx.strokeStyle =
        "#dff8ff";

    ctx.lineWidth = 5;

    ctx.beginPath();

    ctx.arc(
        x,
        y - 52,
        34,
        Math.PI,
        Math.PI * 2
    );

    ctx.stroke();
}


/* =====================================================
   ARENAS
===================================================== */

const arenas = [];


function createArenas() {

    arenas.length = 0;


    islands.forEach(
        island => {

            /*
               Small arena in each island.
            */

            arenas.push({

                x:
                    island.x +
                    island.w / 2 -
                    180,

                y:
                    island.y +
                    island.h / 2 -
                    140,

                w: 360,
                h: 280
            });
        }
    );
}


function drawArenas() {

    arenas.forEach(
        arena => {

            roundRect(
                arena.x,
                arena.y,
                arena.w,
                arena.h,
                35,
                C.arenaDark
            );

            roundRect(
                arena.x + 10,
                arena.y + 10,
                arena.w - 20,
                arena.h - 20,
                28,
                C.arena
            );


            ctx.strokeStyle =
                C.arenaLine;

            ctx.lineWidth = 4;

            ctx.strokeRect(
                arena.x + 25,
                arena.y + 25,
                arena.w - 50,
                arena.h - 50
            );
        }
    );
}


/* =====================================================
   MAP OBJECTS
===================================================== */

function drawMapObjects() {

    /*
       Roads are drawn first.
    */

    buildRoadNetwork();

    drawArenas();

    drawFountain();
}


/* =====================================================
   COLLISION
===================================================== */

function pointInsideRect(
    x,
    y,
    r
) {

    return (
        x >= r.x &&
        x <= r.x + r.w &&
        y >= r.y &&
        y <= r.y + r.h
    );
}


function pointInsideIsland(
    x,
    y,
    island
) {

    /*
       Rectangle collision gives the large
       islands simple and reliable boundaries.
    */

    return (
        x >= island.x &&
        x <= island.x + island.w &&
        y >= island.y &&
        y <= island.y + island.h
    );
}


function pointInsideRoad(
    x,
    y
) {

    for (
        const road of roadAreas
    ) {

        if (
            pointInsideRect(
                x,
                y,
                road
            )
        ) {

            return true;
        }
    }

    return false;
}


function pointInsideArena(
    x,
    y,
    arena
) {

    return pointInsideRect(
        x,
        y,
        arena
    );
}


function isWalkable(
    x,
    y
) {

    /*
       LAND
    */

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

            return true;
        }
    }


    /*
       ROADS OVER WATER

       This is the important fix.
       The water between islands is blocked,
       but the road rectangles are allowed.
    */

    if (
        pointInsideRoad(
            x,
            y
        )
    ) {

        return true;
    }


    /*
       Everything else = water.
    */

    return false;
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

    speed: 280,

    color:
        randomPlayerColor(),

    moving: false,

    direction:
        "down",

    animationTime: 0,

    /*
       Aim vector.
       Starts facing down.
    */

    aimX: 0,
    aimY: 1,

    aiming: false
};


/* =====================================================
   PLAYER MOVEMENT COLLISION
===================================================== */

function movePlayerWithCollision(
    dx,
    dy
) {

    /*
       Small collision radius makes movement
       smoother around road edges.
    */

    const radius = 18;


    /*
       X movement.
    */

    const nextX =
        player.x + dx;


    if (
        isWalkable(
            nextX + Math.sign(dx) * radius,
            player.y
        ) &&
        isWalkable(
            nextX,
            player.y
        )
    ) {

        player.x =
            nextX;
    }


    /*
       Y movement.
    */

    const nextY =
        player.y + dy;


    if (
        isWalkable(
            player.x,
            nextY + Math.sign(dy) * radius
        ) &&
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
   CAMERA
===================================================== */

const camera = {

    zoom: 1,

    minZoom: 0.45,

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
   MAIN MOVEMENT JOYSTICK
===================================================== */

const joystick =
    document.getElementById("joystick");

const joystickKnob =
    document.getElementById("joystickKnob");

let joystickActive = false;
let joystickPointer = null;

let joystickX = 0;
let joystickY = 0;

const JOYSTICK_RADIUS = 35;


const isDesktop =
    window.matchMedia(
        "(hover: hover) and (pointer: fine)"
    ).matches;


if (isDesktop) {

    if (joystick) {
        joystick.style.display = "none";
    }

} else if (
    joystick &&
    joystickKnob
) {

    function updateJoystick(
        clientX,
        clientY
    ) {

        const r =
            joystick.getBoundingClientRect();

        const centerX =
            r.left +
            r.width / 2;

        const centerY =
            r.top +
            r.height / 2;

        let dx =
            clientX - centerX;

        let dy =
            clientY - centerY;

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
}


/* =====================================================
   DYNAMIC RIGHT AIM JOYSTICK
===================================================== */

const aimJoystick =
    document.getElementById(
        "aimJoystick"
    );

const aimJoystickKnob =
    document.getElementById(
        "aimJoystickKnob"
    );


let aimActive = false;
let aimPointerId = null;

let aimCenterX = 0;
let aimCenterY = 0;

let aimX = 0;
let aimY = 1;

const AIM_RADIUS = 42;


/* =====================================================
   AIM JOYSTICK STYLE
===================================================== */

function prepareAimJoystick() {

    if (!aimJoystick)
        return;


    aimJoystick.style.position =
        "fixed";

    aimJoystick.style.width =
        "140px";

    aimJoystick.style.height =
        "140px";

    aimJoystick.style.borderRadius =
        "50%";

    aimJoystick.style.display =
        "none";

    aimJoystick.style.zIndex =
        "30";

    aimJoystick.style.pointerEvents =
        "none";

    aimJoystick.style.transform =
        "translate(-50%, -50%)";
}


prepareAimJoystick();


function showAimJoystick(
    clientX,
    clientY
) {

    if (!aimJoystick)
        return;


    aimActive = true;

    aimCenterX =
        clientX;

    aimCenterY =
        clientY;


    aimJoystick.style.left =
        clientX + "px";

    aimJoystick.style.top =
        clientY + "px";

    aimJoystick.style.display =
        "flex";


    aimX = 0;
    aimY = 0;


    if (aimJoystickKnob) {

        aimJoystickKnob.style.transform =
            "translate(0,0)";
    }


    player.aiming = true;
}


function updateAimJoystick(
    clientX,
    clientY
) {

    if (!aimActive)
        return;


    let dx =
        clientX -
        aimCenterX;

    let dy =
        clientY -
        aimCenterY;


    const distance =
        Math.hypot(
            dx,
            dy
        );


    if (
        distance > AIM_RADIUS
    ) {

        dx =
            dx /
            distance *
            AIM_RADIUS;

        dy =
            dy /
            distance *
            AIM_RADIUS;
    }


    if (
        distance > 5
    ) {

        aimX =
            dx /
            AIM_RADIUS;

        aimY =
            dy /
            AIM_RADIUS;


        const length =
            Math.hypot(
                aimX,
                aimY
            );


        if (
            length > 0
        ) {

            aimX /=
                length;

            aimY /=
                length;
        }


        player.aimX =
            aimX;

        player.aimY =
            aimY;
    }


    if (aimJoystickKnob) {

        aimJoystickKnob.style.transform =
            `translate(${dx}px,${dy}px)`;
    }
}


function hideAimJoystick() {

    aimActive = false;
    aimPointerId = null;

    player.aiming = false;

    aimX = 0;
    aimY = 0;


    if (aimJoystick) {

        aimJoystick.style.display =
            "none";
    }


    if (aimJoystickKnob) {

        aimJoystickKnob.style.transform =
            "translate(0,0)";
    }
}


/* =====================================================
   RIGHT-SIDE TOUCH AIM
===================================================== */

canvas.addEventListener(
    "pointerdown",
    event => {

        /*
           Ignore the left half.
           The left joystick owns movement.
        */

        if (
            event.clientX <
            window.innerWidth / 2
        ) {

            return;
        }


        /*
           Mouse:
           only create aim joystick while
           holding a mouse button.
        */

        if (
            event.pointerType ===
            "mouse" &&
            event.button !== 0
        ) {

            return;
        }


        aimPointerId =
            event.pointerId;


        canvas.setPointerCapture(
            event.pointerId
        );


        showAimJoystick(
            event.clientX,
            event.clientY
        );


        updateAimJoystick(
            event.clientX,
            event.clientY
        );
    }
);


canvas.addEventListener(
    "pointermove",
    event => {

        if (
            !aimActive
        )
            return;


        if (
            event.pointerId !==
            aimPointerId
        )
            return;


        updateAimJoystick(
            event.clientX,
            event.clientY
        );
    }
);


canvas.addEventListener(
    "pointerup",
    event => {

        if (
            event.pointerId !==
            aimPointerId
        )
            return;


        hideAimJoystick();
    }
);


canvas.addEventListener(
    "pointercancel",
    event => {

        if (
            event.pointerId !==
            aimPointerId
        )
            return;


        hideAimJoystick();
    }
);


/* =====================================================
   AIM ANGLE
===================================================== */

function getAimAngle(p) {

    let x =
        Number(
            p.aimX
        );

    let y =
        Number(
            p.aimY
        );


    if (
        !Number.isFinite(x) ||
        !Number.isFinite(y)
    ) {

        x = 0;
        y = 1;
    }


    if (
        Math.hypot(x, y) < 0.05
    ) {

        x = 0;
        y = 1;
    }


    return Math.atan2(
        y,
        x
    );
}


/* =====================================================
   EYE AIM
===================================================== */

function getEyeOffset(
    p,
    scale
) {

    let x =
        Number(
            p.aimX
        ) || 0;

    let y =
        Number(
            p.aimY
        ) || 1;


    const length =
        Math.hypot(
            x,
            y
        );


    if (
        length > 0
    ) {

        x /=
            length;

        y /=
            length;
    }


    /*
       Eyes move in the direction of the gun.

       x = horizontal eye movement
       y = vertical eye movement
    */

    return {

        x:
            x *
            3.5 *
            scale,

        y:
            y *
            2.5 *
            scale
    };
}


/* =====================================================
   MOVEMENT
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
        Math.abs(joystickX) > 0.05 ||
        Math.abs(joystickY) > 0.05
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
   MOVEMENT DIRECTION
===================================================== */

function getDirection(
    x,
    y
) {

    if (
        Math.abs(x) < 0.15 &&
        Math.abs(y) < 0.15
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
        ) % 360;


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


function update(time) {

    const delta =
        Math.min(
            (
                time -
                lastTime
            ) / 1000,
            0.05
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
        Math.abs(moveX) > 0.05 ||
        Math.abs(moveY) > 0.05;


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
   GUN
===================================================== */

function drawGun(
    cx,
    cy,
    scale,
    p
) {

    const angle =
        getAimAngle(p);


    ctx.save();


    ctx.translate(
        cx,
        cy
    );


    ctx.rotate(
        angle
    );


    /*
       Shoulder mount
    */

    roundRect(
        5 * scale,
        -6 * scale,
        11 * scale,
        12 * scale,
        3 * scale,
        "#33383d"
    );


    /*
       Weapon body
    */

    roundRect(
        8 * scale,
        -5 * scale,
        23 * scale,
        10 * scale,
        3 * scale,
        "#24282c"
    );


    /*
       Barrel
    */

    rect(
        27 * scale,
        -2 * scale,
        17 * scale,
        4 * scale,
        "#111417"
    );


    /*
       Sight
    */

    rect(
        16 * scale,
        -9 * scale,
        7 * scale,
        4 * scale,
        "#111417"
    );


    /*
       Magazine
    */

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
   EYE
===================================================== */

function drawEye(
    x,
    y,
    scale
) {

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
   PLAYER SPRITE
===================================================== */

function drawPlayerSprite(
    cx,
    cy,
    scale,
    p
) {

    let breathing = 0;


    if (!p.moving) {

        breathing =
            Math.sin(
                p.animationTime *
                3
            ) *
            1.2;
    }


    cy -= breathing;


    /*
       Shadow
    */

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


    /*
       Legs
    */

    let legA = 0;
    let legB = 0;


    if (p.moving) {

        legA =
            Math.sin(
                p.animationTime *
                10
            ) *
            0.45;

        legB =
            Math.sin(
                p.animationTime *
                10 +
                Math.PI
            ) *
            0.45;
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


    const legDistance =
        10 * scale;


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


    /*
       Torso
    */

    const torsoWidth =
        22 * scale;

    const torsoHeight =
        24 * scale;


    ctx.fillStyle =
        p.color ||
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
        p.color ||
        player.color;

    ctx.fill();


    ctx.strokeStyle =
        "rgba(0,0,0,.45)";

    ctx.lineWidth =
        2 * scale;

    ctx.stroke();


    /*
       Eyes follow AIM JOYSTICK.
    */

    const eye =
        getEyeOffset(
            p,
            scale
        );


    drawEye(
        cx -
            5 * scale +
            eye.x,
        cy -
            10 * scale +
            eye.y,
        scale
    );


    drawEye(
        cx +
            5 * scale +
            eye.x,
        cy -
            10 * scale +
            eye.y,
        scale
    );


    /*
       Gun follows aim joystick
       in full 360 degrees.
    */

    drawGun(
        cx,
        cy,
        scale,
        p
    );


    /*
       Name
    */

    ctx.font =
        `bold ${
            13 * scale
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
            29 * scale
    );
}


/* =====================================================
   DRAW LOCAL PLAYER
===================================================== */

function drawPlayer() {

    drawPlayerSprite(
        width / 2,
        height / 2,
        camera.zoom,
        {
            ...player,
            name: "You"
        }
    );
}


/* =====================================================
   REMOTE PLAYERS
===================================================== */

function drawRemotePlayers() {

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


    remotePlayers.forEach(
        remote => {

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
                screenX < -150 ||
                screenX >
                    width + 150 ||
                screenY < -150 ||
                screenY >
                    height + 150
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
       Water background.
    */

    drawWater();


    /*
       Islands.
    */

    islands.forEach(
        (island, index) => {

            drawIsland(
                island,
                index
            );
        }
    );


    /*
       Nature.
    */

    if (!natureCanvas) {

        createNatureLayer();
    }


    ctx.drawImage(
        natureCanvas,
        0,
        0
    );


    /*
       Roads + objects.
    */

    drawMapObjects();


    ctx.restore();


    /*
       Players are drawn in screen coordinates.
    */

    drawRemotePlayers();

    drawPlayer();
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
                camera.zoom + 0.1
            );
        }
    );
}


if (zoomOut) {

    zoomOut.addEventListener(
        "pointerdown",
        () => {

            setZoom(
                camera.zoom - 0.1
            );
        }
    );
}


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
                    ? -0.1
                    : 0.1
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

const touches = new Map();

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
                        false,

                    aimX:
                        player.aimX,

                    aimY:
                        player.aimY
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


/* =====================================================
   MULTIPLAYER MESSAGE
===================================================== */

function handleMultiplayerMessage(
    data
) {

    if (!data)
        return;


    if (
        data.type ===
        "welcome"
    ) {

        if (data.id) {

            multiplayerId =
                data.id;
        }

        return;
    }


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

        if (data.id) {

            remotePlayers.delete(
                data.id
            );
        }

        return;
    }


    if (data.id) {

        updateRemotePlayer(
            data
        );
    }
}


/* =====================================================
   REMOTE PLAYER UPDATE
===================================================== */

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
                ) || 0,

            y:
                Number(
                    data.y
                ) || 0,

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

            aimX:
                Number(
                    data.aimX
                ) || 0,

            aimY:
                Number(
                    data.aimY
                ) || 1,

            animationTime:
                Number(
                    data.animationTime
                ) || 0
        }
    );
}


/* =====================================================
   SEND PLAYER STATE
===================================================== */

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
                    player.moving,

                /*
                   360° aim data
                */

                aimX:
                    player.aimX,

                aimY:
                    player.aimY
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

function gameLoop(time) {

    update(time);


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
   START WORLD
===================================================== */

createArenas();

buildRoadNetwork();


/* =====================================================
   START GAME
===================================================== */

requestAnimationFrame(
    gameLoop
);


/* =====================================================
   START MULTIPLAYER
===================================================== */

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
   CHAT TOGGLE
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


/* =====================================================
   CHAT HOTKEY
===================================================== */

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


            if (gameChat) {

                gameChat.classList.add(
                    "open"
                );
            }


            if (chatInput) {

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
   ADD CHAT MESSAGE
===================================================== */

function addChatMessage(
    message
) {

    if (!chatMessages)
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


    /*
       Keep maximum 50 messages.
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

        loadingChat =
            false;
    }
}


/* =====================================================
   SEND CHAT
===================================================== */

async function sendChatMessage() {

    if (!chatInput)
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

if (chatInput) {

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


if (chatSend) {

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

if (chatToggle) {

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
