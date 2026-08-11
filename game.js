/* =====================================================
   MINI HAVEN
   CANVAS + MULTIPLAYER + 360 AIM
===================================================== */

const canvas =
    document.getElementById("game");

const ctx =
    canvas.getContext("2d");

ctx.imageSmoothingEnabled = true;


/* =====================================================
   WORLD
===================================================== */

const WORLD_WIDTH = 4200;
const WORLD_HEIGHT = 3300;

const MAP_CENTER_X =
    WORLD_WIDTH / 2;

const MAP_CENTER_Y =
    WORLD_HEIGHT / 2;


/* =====================================================
   BIG ISLANDS
===================================================== */

const ISLAND_W = 1100;
const ISLAND_H = 760;

const ISLAND_GAP_X = 120;
const ISLAND_GAP_Y = 120;

const GRID_START_X = 80;
const GRID_START_Y = 80;

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
   COLORS
===================================================== */

const C = {

    water: "#55c4d2",
    waterDark: "#3eabbc",

    grass: "#69b75b",
    grassDark: "#438f49",

    forest: "#4a9d4e",

    snow: "#eef5f4",
    snowShadow: "#d9e5e5",

    sand: "#e9c47b",
    sandDark: "#c99e5c",

    road: "#62676a",
    roadDark: "#4c5154",
    roadLine: "#d7d8d1",

    stone: "#969b9b",
    stoneDark: "#737878"
};


/* =====================================================
   CANVAS
===================================================== */

let width = 0;
let height = 0;
let dpr = 1;


function resize() {

    width =
        window.innerWidth;

    height =
        window.innerHeight;

    dpr =
        Math.min(
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

resize();


/* =====================================================
   HELPERS
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


function rect(
    x,
    y,
    w,
    h,
    color
) {

    ctx.fillStyle =
        color;

    ctx.fillRect(
        x,
        y,
        w,
        h
    );
}


function circle(
    x,
    y,
    r,
    color
) {

    ctx.fillStyle =
        color;

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


function roundRect(
    x,
    y,
    w,
    h,
    radius,
    color
) {

    ctx.fillStyle =
        color;

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

            if (
                randomHash(
                    x,
                    y,
                    12
                ) > .55
            ) {

                ctx.strokeStyle =
                    "rgba(255,255,255,.3)";

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
   ISLANDS
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
    ) {

        color =
            C.forest;

    } else if (
        island.type ===
        "snow"
    ) {

        color =
            C.snow;

    } else if (
        island.type ===
        "desert"
    ) {

        color =
            C.sand;

    } else if (
        island.type ===
        "rock"
    ) {

        color =
            C.stone;
    }


    roundRect(
        island.x + 15,
        island.y + 15,
        island.w,
        island.h,
        75,
        "rgba(0,0,0,.14)"
    );


    roundRect(
        island.x,
        island.y,
        island.w,
        island.h,
        70,
        color
    );


    for (
        let y =
            island.y + 30;

        y <
            island.y +
            island.h -
            20;

        y += 50
    ) {

        for (
            let x =
                island.x + 30;

            x <
                island.x +
                island.w -
                20;

            x += 55
        ) {

            if (
                randomHash(
                    x,
                    y,
                    index + 50
                ) > .83
            ) {

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

function drawNature() {

    islands.forEach(
        (island, index) => {

            const count =
                Math.floor(
                    island.w *
                    island.h /
                    26000
                );


            for (
                let n = 0;
                n < count;
                n++
            ) {

                const x =
                    island.x +
                    40 +
                    randomHash(
                        n,
                        index,
                        500
                    ) *
                    (
                        island.w - 80
                    );


                const y =
                    island.y +
                    45 +
                    randomHash(
                        n,
                        index,
                        900
                    ) *
                    (
                        island.h - 90
                    );


                if (
                    island.type ===
                    "desert"
                ) {

                    if (
                        randomHash(
                            n,
                            index,
                            1000
                        ) > .45
                    ) {

                        rect(
                            x - 4,
                            y - 18,
                            8,
                            30,
                            "#4d9c4d"
                        );

                        rect(
                            x - 14,
                            y - 8,
                            10,
                            6,
                            "#4d9c4d"
                        );
                    }

                } else if (
                    island.type ===
                    "rock"
                ) {

                    circle(
                        x,
                        y,
                        13,
                        C.stoneDark
                    );

                } else {

                    rect(
                        x - 4,
                        y + 2,
                        8,
                        18,
                        "#75492d"
                    );

                    circle(
                        x,
                        y - 5,
                        15,
                        "#347346"
                    );

                    circle(
                        x - 9,
                        y + 2,
                        11,
                        "#347346"
                    );

                    circle(
                        x + 9,
                        y + 2,
                        11,
                        "#438b50"
                    );

                    circle(
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
===================================================== */

const ROAD_WIDTH = 150;
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
        p += 75
    ) {

        rect(
            p,
            y - 3,
            42,
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
        let p = y + 15;
        p < y + h;
        p += 75
    ) {

        rect(
            x - 3,
            p,
            6,
            42,
            C.roadLine
        );
    }
}


/* =====================================================
   ROAD NETWORK
===================================================== */

function drawGridRoads() {

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


    for (
        let row = 0;
        row < 3;
        row++
    ) {

        const a =
            islands.find(
                i =>
                    i.row === row &&
                    i.col === 0
            );

        const b =
            islands.find(
                i =>
                    i.row === row &&
                    i.col === 1
            );

        const c =
            islands.find(
                i =>
                    i.row === row &&
                    i.col === 2
            );


        const y =
            a.y +
            a.h / 2;


        drawRoadH(
            a.x + a.w - 10,
            y,
            b.x -
            (
                a.x +
                a.w
            ) +
            20
        );


        drawRoadH(
            b.x + b.w - 10,
            y,
            c.x -
            (
                b.x +
                b.w
            ) +
            20
        );
    }


    for (
        let col = 0;
        col < 3;
        col++
    ) {

        const a =
            islands.find(
                i =>
                    i.row === 0 &&
                    i.col === col
            );

        const b =
            islands.find(
                i =>
                    i.row === 1 &&
                    i.col === col
            );

        const c =
            islands.find(
                i =>
                    i.row === 2 &&
                    i.col === col
            );


        const x =
            a.x +
            a.w / 2;


        drawRoadV(
            x,
            a.y + a.h - 10,
            b.y -
            (
                a.y +
                a.h
            ) +
            20
        );


        drawRoadV(
            x,
            b.y + b.h - 10,
            c.y -
            (
                b.y +
                b.h
            ) +
            20
        );
    }
}


function pointOnRoad(x, y) {

    const half = ROAD_WIDTH / 2;


    /* =================================================
       HORIZONTAL MAIN ROADS
    ================================================= */

    for (const island of islands) {

        const roadY =
            island.y +
            island.h / 2;

        if (
            Math.abs(y - roadY) <= half &&
            x >= 0 &&
            x <= WORLD_WIDTH
        ) {

            return true;
        }
    }


    /* =================================================
       VERTICAL MAIN ROADS
    ================================================= */

    for (const island of islands) {

        const roadX =
            island.x +
            island.w / 2;

        if (
            Math.abs(x - roadX) <= half &&
            y >= 0 &&
            y <= WORLD_HEIGHT
        ) {

            return true;
        }
    }


    /* =================================================
       HORIZONTAL CONNECTORS
    ================================================= */

    for (let row = 0; row < 3; row++) {

        const a =
            islands.find(
                i =>
                    i.row === row &&
                    i.col === 0
            );

        const b =
            islands.find(
                i =>
                    i.row === row &&
                    i.col === 1
            );

        const c =
            islands.find(
                i =>
                    i.row === row &&
                    i.col === 2
            );

        const roadY =
            a.y +
            a.h / 2;


        /* Island 0 → Island 1 */

        if (
            Math.abs(y - roadY) <= half &&
            x >= a.x + a.w - 20 &&
            x <= b.x + 20
        ) {

            return true;
        }


        /* Island 1 → Island 2 */

        if (
            Math.abs(y - roadY) <= half &&
            x >= b.x + b.w - 20 &&
            x <= c.x + 20
        ) {

            return true;
        }
    }


    /* =================================================
       VERTICAL CONNECTORS
    ================================================= */

    for (let col = 0; col < 3; col++) {

        const a =
            islands.find(
                i =>
                    i.row === 0 &&
                    i.col === col
            );

        const b =
            islands.find(
                i =>
                    i.row === 1 &&
                    i.col === col
            );

        const c =
            islands.find(
                i =>
                    i.row === 2 &&
                    i.col === col
            );

        const roadX =
            a.x +
            a.w / 2;


        /* Island 0 → Island 1 */

        if (
            Math.abs(x - roadX) <= half &&
            y >= a.y + a.h - 20 &&
            y <= b.y + 20
        ) {

            return true;
        }


        /* Island 1 → Island 2 */

        if (
            Math.abs(x - roadX) <= half &&
            y >= b.y + b.h - 20 &&
            y <= c.y + 20
        ) {

            return true;
        }
    }


    return false;
}


    /* Islands are walkable */

    for (
        const island of islands
    ) {

        if (
            pointInside(
                x,
                y,
                island
            )
        ) {

            return true;
        }
    }


    /* Roads over water are also walkable */

    if (
        pointOnRoad(
            x,
            y
        )
    ) {

        return true;
    }


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
        i =>
            i.row === 1 &&
            i.col === 1
    );


const player = {

    x:
        centerIsland.x +
        centerIsland.w / 2,

    y:
        centerIsland.y +
        centerIsland.h / 2,

    speed: 230,

    color:
        randomPlayerColor(),

    moving: false,

    direction: "down",

    aimAngle: 0,

    aiming: false,

    animationTime: 0
};


/* =====================================================
   CAMERA
===================================================== */

const camera = {

    zoom: 1,

    minZoom: .45,

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
   DYNAMIC MOVEMENT JOYSTICK
===================================================== */

let movementJoystick = null;
let movementKnob = null;

let movementPointer = null;
let movementActive = false;

let joystickX = 0;
let joystickY = 0;

const MOVEMENT_RADIUS = 55;

function createMovementJoystick(x, y, pointerId) {

    destroyMovementJoystick();

    movementActive = true;
    movementPointer = pointerId;

    movementJoystick = document.createElement("div");
    movementKnob = document.createElement("div");

    movementJoystick.id = "joystick";
    movementKnob.id = "joystickKnob";

    movementJoystick.style.left = `${x - 70}px`;
    movementJoystick.style.top = `${y - 70}px`;
    movementJoystick.style.bottom = "auto";

    movementJoystick.appendChild(movementKnob);

    document.body.appendChild(movementJoystick);
}

function updateMovementJoystick(clientX, clientY) {

    if (!movementJoystick || !movementKnob) return;

    const r =
        movementJoystick.getBoundingClientRect();

    const centerX =
        r.left + r.width / 2;

    const centerY =
        r.top + r.height / 2;

    let dx =
        clientX - centerX;

    let dy =
        clientY - centerY;

    const distance =
        Math.hypot(dx, dy);

    if (distance > MOVEMENT_RADIUS) {

        dx =
            dx / distance *
            MOVEMENT_RADIUS;

        dy =
            dy / distance *
            MOVEMENT_RADIUS;
    }

    joystickX =
        dx / MOVEMENT_RADIUS;

    joystickY =
        dy / MOVEMENT_RADIUS;

    movementJoystick
        .querySelector("#joystickKnob")
        .style.transform =
        `translate(${dx}px, ${dy}px)`;
}

function destroyMovementJoystick() {

    movementActive = false;
    movementPointer = null;

    joystickX = 0;
    joystickY = 0;

    if (movementJoystick) {
        movementJoystick.remove();
    }

    movementJoystick = null;
    movementKnob = null;
}

/* =====================================================
   MOBILE MOVEMENT TOUCH
===================================================== */

canvas.addEventListener("pointerdown", event => {

    if (event.pointerType !== "touch") {
        return;
    }

    /* LEFT HALF = MOVEMENT */

    if (event.clientX < width / 2) {

        createMovementJoystick(
            event.clientX,
            event.clientY,
            event.pointerId
        );

        updateMovementJoystick(
            event.clientX,
            event.clientY
        );

        return;
    }

    /* RIGHT HALF = AIM */

    createAimJoystick(
        event.clientX,
        event.clientY,
        event.pointerId
    );

    updateAimJoystick(
        event.clientX,
        event.clientY
    );
});


canvas.addEventListener("pointermove", event => {

    if (event.pointerType !== "touch") {
        return;
    }

    if (
        movementActive &&
        event.pointerId === movementPointer
    ) {

        updateMovementJoystick(
            event.clientX,
            event.clientY
        );

        return;
    }

    if (
        aimActive &&
        event.pointerId === aimPointer
    ) {

        updateAimJoystick(
            event.clientX,
            event.clientY
        );
    }
});


canvas.addEventListener("pointerup", event => {

    if (
        movementActive &&
        event.pointerId === movementPointer
    ) {

        destroyMovementJoystick();
    }

    if (
        aimActive &&
        event.pointerId === aimPointer
    ) {

        destroyAimJoystick();
    }
});


canvas.addEventListener("pointercancel", event => {

    if (
        movementActive &&
        event.pointerId === movementPointer
    ) {

        destroyMovementJoystick();
    }

    if (
        aimActive &&
        event.pointerId === aimPointer
    ) {

        destroyAimJoystick();
    }
});

/* =====================================================
   DYNAMIC AIM JOYSTICK
===================================================== */

let aimJoystick = null;
let aimKnob = null;

let aimPointer = null;

let aimActive = false;

let aimX = 0;
let aimY = 0;

const AIM_RADIUS = 55;


/* =====================================================
   CREATE AIM JOYSTICK
===================================================== */

function createAimJoystick(
    x,
    y,
    pointerId = null
) {

    destroyAimJoystick();


    aimActive = true;

    aimPointer =
        pointerId;


    aimJoystick =
        document.createElement(
            "div"
        );


    aimKnob =
        document.createElement(
            "div"
        );


    aimJoystick.id =
    "aimJoystick";

aimKnob.id =
    "aimJoystickKnob";

    aimJoystick.style.left =
        `${x - 70}px`;

    aimJoystick.style.top =
        `${y - 70}px`;


    aimJoystick.appendChild(
        aimKnob
    );


    document.body.appendChild(
        aimJoystick
    );
}


/* =====================================================
   AIM UPDATE
===================================================== */

function updateAimJoystick(
    clientX,
    clientY
) {

    if (
        !aimJoystick ||
        !aimKnob
    ) {

        return;
    }


    const r =
        aimJoystick.getBoundingClientRect();


    const centerX =
        r.left +
        r.width / 2;

    const centerY =
        r.top +
        r.height / 2;


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
        AIM_RADIUS
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


    aimX =
        dx /
        AIM_RADIUS;

    aimY =
        dy /
        AIM_RADIUS;


    if (
        distance > 8
    ) {

        player.aimAngle =
            Math.atan2(
                aimY,
                aimX
            );

        player.aiming = true;
    }


    aimKnob.style.transform =
        `translate(${dx}px, ${dy}px)`;
}


/* =====================================================
   DESTROY AIM JOYSTICK
===================================================== */

function destroyAimJoystick() {

    aimActive = false;

    aimPointer = null;

    aimX = 0;
    aimY = 0;


    if (
        aimJoystick
    ) {

        aimJoystick.remove();
    }


    aimJoystick = null;
    aimKnob = null;

    player.aiming = false;
}



/* =====================================================
   DESKTOP RIGHT-MOUSE AIM
===================================================== */

let mouseAimActive = false;

canvas.addEventListener("contextmenu", event => {
    event.preventDefault();
});

canvas.addEventListener("pointerdown", event => {

    if (event.pointerType !== "mouse") {
        return;
    }

    /* RIGHT MOUSE BUTTON */

    if (event.button !== 2) {
        return;
    }

    mouseAimActive = true;

    createAimJoystick(
        event.clientX,
        event.clientY
    );

    updateMouseAim(
        event.clientX,
        event.clientY
    );
});


canvas.addEventListener("pointermove", event => {

    if (
        event.pointerType !== "mouse" ||
        !mouseAimActive
    ) {
        return;
    }

    /* Move the visual joystick with mouse */

    if (aimJoystick) {

        aimJoystick.style.left =
            `${event.clientX - 70}px`;

        aimJoystick.style.top =
            `${event.clientY - 70}px`;
    }

    updateMouseAim(
        event.clientX,
        event.clientY
    );
});


window.addEventListener("pointerup", event => {

    if (
        event.pointerType === "mouse" &&
        event.button === 2
    ) {

        mouseAimActive = false;

        destroyAimJoystick();
    }
});



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
        Math.abs(joystickX) > .05 ||
        Math.abs(joystickY) > .05
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
        ) % 360;


    if (
        degrees < 22.5 ||
        degrees >= 337.5
    )
        return "right";

    if (
        degrees < 67.5
    )
        return "down-right";

    if (
        degrees < 112.5
    )
        return "down";

    if (
        degrees < 157.5
    )
        return "down-left";

    if (
        degrees < 202.5
    )
        return "left";

    if (
        degrees < 247.5
    )
        return "up-left";

    if (
        degrees < 292.5
    )
        return "up";

    return "up-right";
}


/* =====================================================
   COLLISION MOVEMENT
===================================================== */

function movePlayer(
    dx,
    dy
) {

    const nextX =
        player.x +
        dx;


    if (
        isWalkable(
            nextX,
            player.y
        )
    ) {

        player.x =
            nextX;
    }


    const nextY =
        player.y +
        dy;


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
   CHAT UI
===================================================== */

const chatToggle =
    document.getElementById("chatToggle");

const gameChat =
    document.getElementById("gameChat");

const chatInput =
    document.getElementById("chatInput");

const chatSend =
    document.getElementById("chatSend");


if (chatToggle && gameChat) {

    chatToggle.addEventListener(
        "pointerdown",
        event => {

            event.preventDefault();
            event.stopPropagation();

            gameChat.classList.toggle("open");

            if (
                gameChat.classList.contains("open") &&
                chatInput
            ) {
                setTimeout(() => {
                    chatInput.focus();
                }, 50);
            }
        }
    );
}
/* =====================================================
   RENDER CHAT
===================================================== */

const RENDER_CHAT_URL =
    "https://my-roblox-private-chat.onrender.com";

let lastChatTime = 0;


/* =====================================================
   SEND CHAT TO RENDER
===================================================== */

async function sendChatMessage() {

    if (!chatInput) {
        return;
    }

    const message =
        chatInput.value.trim();

    if (!message) {
        return;
    }

    try {

        const response =
            await fetch(
                `${RENDER_CHAT_URL}/send`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        user:
                            multiplayerId,

                        displayName:
                            multiplayerName,

                        msg:
                            message,

                        source:
                            "website",

                        private:
                            false
                    })
                }
            );


        if (!response.ok) {
            throw new Error(
                "Chat send failed"
            );
        }


        chatInput.value = "";

    } catch (error) {

        console.error(
            "Chat error:",
            error
        );
    }
}

/* =====================================================
   MULTIPLAYER
===================================================== */

const MULTIPLAYER_URL =
    "wss://mini-haven-cloudfare-server.umeshjamre321.workers.dev/game?room=main";


let socket = null;

let multiplayerConnected =
    false;


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

} catch {}


if (!multiplayerName) {

    multiplayerName =
        "Player" +
        Math.floor(
            Math.random() *
            9999
        );
}


const remotePlayers =
    new Map();


/* =====================================================
   CONNECT
===================================================== */

function connectMultiplayer() {

    try {

        socket =
            new WebSocket(
                MULTIPLAYER_URL
            );

    } catch {

        return;
    }


    socket.addEventListener(
        "open",
        () => {

            multiplayerConnected =
                true;


            socket.send(
                JSON.stringify({

                    type: "join",

                    name:
                        multiplayerName,

                    x:
                        player.x,

                    y:
                        player.y,

                    color:
                        player.color,

                    moveX: 0,

                    moveY: 0,

                    direction:
                        player.direction,

                    moving: false,

                    aimAngle:
                        player.aimAngle,

                    aiming:
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

            } catch {}
        }
    );


    socket.addEventListener(
        "close",
        () => {

            multiplayerConnected =
                false;


            setTimeout(
                connectMultiplayer,
                3000
            );
        }
    );


    socket.addEventListener(
        "error",
        () => {

            multiplayerConnected =
                false;
        }
    );
}


/* =====================================================
   SERVER MESSAGE
===================================================== */

function handleMultiplayerMessage(
    data
) {

    if (!data) {
        return;
    }


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
        data.type ===
        "snapshot"
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
        "playerJoined"
    ) {

        updateRemotePlayer(
            data.player
        );

        return;
    }


    if (
        data.type ===
        "playerLeft"
    ) {

        remotePlayers.delete(
            data.id
        );

        return;
    }
}


/* =====================================================
   REMOTE PLAYER UPDATE
===================================================== */

function updateRemotePlayer(
    data
) {

    if (!data) {
        return;
    }


    const id =
        data.id;


    if (!id) {
        return;
    }


    if (
        id ===
        multiplayerId
    ) {

        return;
    }


    let remote =
        remotePlayers.get(
            id
        );


    if (!remote) {

        remote = {

            id,

            x:
                Number(data.x) || 0,

            y:
                Number(data.y) || 0,

            targetX:
                Number(data.x) || 0,

            targetY:
                Number(data.y) || 0,

            moveX:
                Number(data.moveX) || 0,

            moveY:
                Number(data.moveY) || 0,

            color:
                data.color ||
                "#4DA6FF",

            name:
                data.name ||
                "Player",

            direction:
                data.direction ||
                "down",

            moving:
                Boolean(
                    data.moving
                ),

            aimAngle:
                Number(
                    data.aimAngle
                ) || 0,

            targetAimAngle:
                Number(
                    data.aimAngle
                ) || 0,

            aiming:
                Boolean(
                    data.aiming
                ),

            animationTime: 0
        };


        remotePlayers.set(
            id,
            remote
        );


        return;
    }


    remote.targetX =
        Number(data.x) ||
        remote.targetX;

    remote.targetY =
        Number(data.y) ||
        remote.targetY;


    remote.moveX =
        Number(data.moveX) ||
        0;

    remote.moveY =
        Number(data.moveY) ||
        0;


    remote.color =
        data.color ||
        remote.color;


    remote.name =
        data.name ||
        remote.name;


    remote.direction =
        data.direction ||
        remote.direction;


    remote.moving =
        Boolean(
            data.moving
        );


    if (
        Number.isFinite(
            data.aimAngle
        )
    ) {

        remote.targetAimAngle =
            data.aimAngle;
    }


    remote.aiming =
        Boolean(
            data.aiming
        );
}


/* =====================================================
   REMOTE PLAYER PREDICTION
===================================================== */

function updateRemotePlayers(
    delta
) {

    remotePlayers.forEach(
        remote => {

            remote.animationTime +=
                delta;


            /* Predict movement */

            if (
                remote.moving
            ) {

                const length =
                    Math.hypot(
                        remote.moveX,
                        remote.moveY
                    );


                let mx =
                    remote.moveX;

                let my =
                    remote.moveY;


                if (
                    length > 1
                ) {

                    mx /=
                        length;

                    my /=
                        length;
                }


                remote.x +=
                    mx *
                    player.speed *
                    delta;

                remote.y +=
                    my *
                    player.speed *
                    delta;
            }


            /* Correct toward latest server position */

            const errorX =
                remote.targetX -
                remote.x;

            const errorY =
                remote.targetY -
                remote.y;


            remote.x +=
                errorX *
                Math.min(
                    1,
                    delta *
                    8
                );

            remote.y +=
                errorY *
                Math.min(
                    1,
                    delta *
                    8
                );


            /* Smooth aim */

            let angleDifference =
                remote.targetAimAngle -
                remote.aimAngle;


            while (
                angleDifference >
                Math.PI
            ) {

                angleDifference -=
                    Math.PI * 2;
            }


            while (
                angleDifference <
                -Math.PI
            ) {

                angleDifference +=
                    Math.PI * 2;
            }


            remote.aimAngle +=
                angleDifference *
                Math.min(
                    1,
                    delta * 12
                );
        }
    );
}


/* =====================================================
   SEND CLIENT STATE EVERY 200ms
===================================================== */

let lastNetworkSend = 0;


function sendPlayerState(
    time
) {

    if (
        !socket ||
        socket.readyState !==
        WebSocket.OPEN
    ) {

        return;
    }


    if (
        time -
        lastNetworkSend <
        200
    ) {

        return;
    }


    lastNetworkSend =
        time;


    const movement =
        getMovement();


    try {

        socket.send(
            JSON.stringify({

                type: "state",

                x:
                    player.x,

                y:
                    player.y,

                moveX:
                    movement.x,

                moveY:
                    movement.y,

                name:
                    multiplayerName,

                color:
                    player.color,

                direction:
                    player.direction,

                moving:
                    player.moving,

                aimAngle:
                    player.aimAngle,

                aiming:
                    player.aiming
            })
        );

    } catch {}
}


/* =====================================================
   DRAW GUN
===================================================== */

function drawGun(
    cx,
    cy,
    scale,
    angle
) {

    ctx.save();


    ctx.translate(
        cx,
        cy
    );


    ctx.rotate(
        angle
    );


    roundRect(
        5 * scale,
        -6 * scale,
        11 * scale,
        12 * scale,
        3 * scale,
        "#33383d"
    );


    roundRect(
        8 * scale,
        -5 * scale,
        23 * scale,
        10 * scale,
        3 * scale,
        "#24282c"
    );


    rect(
        27 * scale,
        -2 * scale,
        17 * scale,
        4 * scale,
        "#111417"
    );


    rect(
        16 * scale,
        -9 * scale,
        7 * scale,
        4 * scale,
        "#111417"
    );


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
   PLAYER SPRITE
===================================================== */

function drawPlayerSprite(
    cx,
    cy,
    scale,
    p
) {

    const breathing =
        p.moving
            ? 0
            : Math.sin(
                p.animationTime *
                3
            ) * 1.2;


    cy -=
        breathing;


    /* Shadow */

    ctx.fillStyle =
        "rgba(0,0,0,.3)";


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


    /* Legs */

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


    function leg(
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


    leg(
        cx -
            10 *
            scale,
        legA
    );


    leg(
        cx +
            10 *
            scale,
        legB
    );


    /* Body */

    ctx.fillStyle =
        p.color ||
        player.color;


    ctx.fillRect(
        cx -
            11 *
            scale,
        cy -
            2 *
            scale,
        22 *
            scale,
        24 *
            scale
    );


    ctx.strokeStyle =
        "rgba(0,0,0,.45)";

    ctx.lineWidth =
        2 *
        scale;


    ctx.strokeRect(
        cx -
            11 *
            scale,
        cy -
            2 *
            scale,
        22 *
            scale,
        24 *
            scale
    );


    /* Head */

    const r =
        13 *
        scale;


    ctx.beginPath();

    ctx.arc(
        cx,
        cy -
            13 *
            scale,
        r,
        Math.PI,
        0
    );


    ctx.lineTo(
        cx + r,
        cy -
            4 *
            scale
    );


    ctx.lineTo(
        cx - r,
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

    ctx.stroke();


    /* =================================================
       EYES FOLLOW AIM
    ================================================= */

    const lookX =
        Math.cos(
            p.aimAngle ||
            0
        );

    const lookY =
        Math.sin(
            p.aimAngle ||
            0
        );


    const eyeOffsetX =
        lookX *
        2.5 *
        scale;


    const eyeOffsetY =
        lookY *
        1.5 *
        scale;


    circle(
        cx -
            5 *
            scale +
            eyeOffsetX,

        cy -
            10 *
            scale +
            eyeOffsetY,

        4.2 *
            scale,

        "#fff"
    );


    circle(
        cx +
            5 *
            scale +
            eyeOffsetX,

        cy -
            10 *
            scale +
            eyeOffsetY,

        4.2 *
            scale,

        "#fff"
    );


    circle(
        cx -
            5 *
            scale +
            eyeOffsetX,

        cy -
            10 *
            scale +
            eyeOffsetY,

        1.7 *
            scale,

        "#111"
    );


    circle(
        cx +
            5 *
            scale +
            eyeOffsetX,

        cy -
            10 *
            scale +
            eyeOffsetY,

        1.7 *
            scale,

        "#111"
    );


    /* Gun */

    drawGun(
        cx,
        cy,
        scale,
        p.aimAngle ||
        0
    );


    /* Name */

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


    drawWater();


    islands.forEach(
        drawIsland
    );


    drawNature();


    drawGridRoads();


    ctx.restore();


    drawRemotePlayers(
        cameraX,
        cameraY
    );


    drawPlayer();
}


/* =====================================================
   REMOTE DRAW
===================================================== */

function drawRemotePlayers(
    cameraX,
    cameraY
) {

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
                screenX <
                    -100 ||
                screenX >
                    width + 100 ||
                screenY <
                    -100 ||
                screenY >
                    height + 100
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
   LOCAL PLAYER
===================================================== */

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
   ZOOM
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
   GAME UPDATE
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


    player.moving =
        Math.abs(
            movement.x
        ) > .05 ||
        Math.abs(
            movement.y
        ) > .05;


    if (
        player.moving
    ) {

        player.direction =
            getDirection(
                movement.x,
                movement.y
            );
    }


    movePlayer(
        movement.x *
        player.speed *
        delta,

        movement.y *
        player.speed *
        delta
    );


    updateRemotePlayers(
        delta
    );


    sendPlayerState(
        time
    );
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
