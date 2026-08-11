const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");


/* =====================================================
   SETTINGS
===================================================== */

const TILE_SIZE = 32;
const CHUNK_SIZE = 16;

const CHUNK_WORLD_SIZE =
    TILE_SIZE * CHUNK_SIZE;

const MAP_WIDTH = 128;
const MAP_HEIGHT = 128;

const WORLD_WIDTH =
    MAP_WIDTH * TILE_SIZE;

const WORLD_HEIGHT =
    MAP_HEIGHT * TILE_SIZE;

const MAP_CENTER_X =
    WORLD_WIDTH / 2;

const MAP_CENTER_Y =
    WORLD_HEIGHT / 2;

const MAP_RADIUS =
    WORLD_WIDTH * 0.45;


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
   TILE TYPES
===================================================== */

const TILE = {

    GRASS: 0,
    WATER: 1,
    DIRT: 2,
    ROAD: 3,
    TREE: 4,
    ROCK: 5,
    HOUSE: 6

};


/* =====================================================
   SMALL BLOCK VISUAL SYSTEM
===================================================== */

const VISUAL_GRID = 4;

const BLOCK_SIZE =
    TILE_SIZE / VISUAL_GRID;


/* =====================================================
   TILE COLORS
===================================================== */

const COLORS = {

    grass: "#6eaa50",
    grassDark: "#588b40",
    grassLight: "#7fba5e",

    water: "#4b91c5",
    waterDark: "#3979a8",
    waterLight: "#62a8d8",

    dirt: "#9a7049",
    dirtDark: "#795438",
    dirtLight: "#ad8054",

    road: "#55585c",
    roadDark: "#45484c",
    roadLight: "#66696d",

    tree: "#347346",
    treeDark: "#285d38",
    treeLight: "#438b50",

    rock: "#777b7f",
    rockDark: "#5d6165",
    rockLight: "#909499",

    wall: "#d1a46b",
    wallDark: "#aa7d4e",

    roof: "#814c43"

};


/* =====================================================
   SEEDED RANDOM
===================================================== */

function hashRandom(x, y, seed = 0) {

    let n =
        Math.sin(
            x * 127.1 +
            y * 311.7 +
            seed * 74.7
        ) * 43758.5453;

    return n - Math.floor(n);
}


/* =====================================================
   DRAW BLOCK
===================================================== */

function block(
    color,
    x,
    y,
    size = BLOCK_SIZE
) {

    ctx.fillStyle = color;

    ctx.fillRect(
        x,
        y,
        size,
        size
    );
}


/* =====================================================
   GRASS
===================================================== */

function drawGrass(
    x,
    y,
    tileX,
    tileY
) {

    block(
        COLORS.grass,
        x,
        y,
        TILE_SIZE
    );

    for (
        let by = 0;
        by < VISUAL_GRID;
        by++
    ) {

        for (
            let bx = 0;
            bx < VISUAL_GRID;
            bx++
        ) {

            const random =
                hashRandom(
                    tileX * 10 + bx,
                    tileY * 10 + by
                );

            if (random < 0.15) {

                block(
                    COLORS.grassDark,
                    x + bx * BLOCK_SIZE,
                    y + by * BLOCK_SIZE
                );

            } else if (random > 0.88) {

                block(
                    COLORS.grassLight,
                    x + bx * BLOCK_SIZE,
                    y + by * BLOCK_SIZE
                );

            }
        }
    }
}


/* =====================================================
   WATER
===================================================== */

function drawWater(
    x,
    y,
    tileX,
    tileY
) {

    block(
        COLORS.water,
        x,
        y,
        TILE_SIZE
    );

    for (
        let by = 0;
        by < VISUAL_GRID;
        by++
    ) {

        for (
            let bx = 0;
            bx < VISUAL_GRID;
            bx++
        ) {

            const random =
                hashRandom(
                    tileX * 7 + bx,
                    tileY * 7 + by,
                    50
                );

            if (random < 0.18) {

                block(
                    COLORS.waterDark,
                    x + bx * BLOCK_SIZE,
                    y + by * BLOCK_SIZE
                );

            } else if (random > 0.86) {

                block(
                    COLORS.waterLight,
                    x + bx * BLOCK_SIZE,
                    y + by * BLOCK_SIZE
                );

            }
        }
    }
}


/* =====================================================
   DIRT
===================================================== */

function drawDirt(
    x,
    y,
    tileX,
    tileY
) {

    block(
        COLORS.dirt,
        x,
        y,
        TILE_SIZE
    );

    for (
        let by = 0;
        by < VISUAL_GRID;
        by++
    ) {

        for (
            let bx = 0;
            bx < VISUAL_GRID;
            bx++
        ) {

            const random =
                hashRandom(
                    tileX * 8 + bx,
                    tileY * 8 + by,
                    20
                );

            if (random < 0.18) {

                block(
                    COLORS.dirtDark,
                    x + bx * BLOCK_SIZE,
                    y + by * BLOCK_SIZE
                );

            } else if (random > 0.88) {

                block(
                    COLORS.dirtLight,
                    x + bx * BLOCK_SIZE,
                    y + by * BLOCK_SIZE
                );

            }
        }
    }
}


/* =====================================================
   ROAD
===================================================== */

function drawRoad(
    x,
    y,
    tileX,
    tileY
) {

    block(
        COLORS.road,
        x,
        y,
        TILE_SIZE
    );

    for (
        let by = 0;
        by < VISUAL_GRID;
        by++
    ) {

        for (
            let bx = 0;
            bx < VISUAL_GRID;
            bx++
        ) {

            const random =
                hashRandom(
                    tileX * 4 + bx,
                    tileY * 4 + by,
                    80
                );

            if (random < 0.15) {

                block(
                    COLORS.roadDark,
                    x + bx * BLOCK_SIZE,
                    y + by * BLOCK_SIZE
                );

            } else if (random > 0.90) {

                block(
                    COLORS.roadLight,
                    x + bx * BLOCK_SIZE,
                    y + by * BLOCK_SIZE
                );

            }
        }
    }
}


/* =====================================================
   TREE
===================================================== */

function drawTree(x, y) {

    block(
        COLORS.grass,
        x,
        y,
        TILE_SIZE
    );

    /* Trunk */

    block(
        "#704a2d",
        x + 12,
        y + 16,
        8
    );

    block(
        "#5d3b25",
        x + 16,
        y + 16,
        4
    );

    /* Leaves */

    block(
        COLORS.treeDark,
        x + 8,
        y + 4,
        16
    );

    block(
        COLORS.tree,
        x + 4,
        y + 8,
        24
    );

    block(
        COLORS.treeLight,
        x + 8,
        y + 4,
        8
    );

    block(
        COLORS.tree,
        x + 12,
        y,
        8
    );
}


/* =====================================================
   ROCK
===================================================== */

function drawRock(x, y) {

    block(
        COLORS.grass,
        x,
        y,
        TILE_SIZE
    );

    block(
        COLORS.rockDark,
        x + 8,
        y + 12,
        16
    );

    block(
        COLORS.rock,
        x + 8,
        y + 8,
        16
    );

    block(
        COLORS.rockLight,
        x + 12,
        y + 8,
        8
    );
}


/* =====================================================
   HOUSE
===================================================== */

function drawHouse(x, y) {

    block(
        COLORS.grass,
        x,
        y,
        TILE_SIZE
    );

    /* Building */

    block(
        COLORS.wall,
        x + 4,
        y + 10,
        24
    );

    /* Roof */

    block(
        COLORS.roof,
        x + 4,
        y + 6,
        24
    );

    block(
        "#70413a",
        x + 8,
        y + 2,
        16
    );

    /* Door */

    block(
        "#593b2c",
        x + 13,
        y + 18,
        6,
        10
    );
}


/* =====================================================
   DRAW TILE
===================================================== */

function drawTile(
    type,
    x,
    y,
    tileX,
    tileY
) {

    switch (type) {

        case TILE.GRASS:
            drawGrass(
                x,
                y,
                tileX,
                tileY
            );
            break;

        case TILE.WATER:
            drawWater(
                x,
                y,
                tileX,
                tileY
            );
            break;

        case TILE.DIRT:
            drawDirt(
                x,
                y,
                tileX,
                tileY
            );
            break;

        case TILE.ROAD:
            drawRoad(
                x,
                y,
                tileX,
                tileY
            );
            break;

        case TILE.TREE:
            drawTree(x, y);
            break;

        case TILE.ROCK:
            drawRock(x, y);
            break;

        case TILE.HOUSE:
            drawHouse(x, y);
            break;
    }
}


/* =====================================================
   CHUNKS
===================================================== */

const chunks = new Map();

function chunkKey(
    chunkX,
    chunkY
) {

    return (
        chunkX +
        "," +
        chunkY
    );
}


/* =====================================================
   GENERATE CHUNK
===================================================== */

function generateChunk(
    chunkX,
    chunkY
) {

    const key =
        chunkKey(
            chunkX,
            chunkY
        );

    if (chunks.has(key)) {

        return chunks.get(key);

    }


    const startX =
        chunkX * CHUNK_SIZE;

    const startY =
        chunkY * CHUNK_SIZE;

    const endX =
        startX +
        CHUNK_SIZE -
        1;

    const endY =
        startY +
        CHUNK_SIZE -
        1;


    /*
        Outside finite map
    */

    if (
        endX < 0 ||
        endY < 0 ||
        startX >= MAP_WIDTH ||
        startY >= MAP_HEIGHT
    ) {

        return null;

    }


    const tiles =
        new Array(
            CHUNK_SIZE *
            CHUNK_SIZE
        );


    for (
        let y = 0;
        y < CHUNK_SIZE;
        y++
    ) {

        for (
            let x = 0;
            x < CHUNK_SIZE;
            x++
        ) {

            const worldX =
                chunkX *
                CHUNK_SIZE +
                x;

            const worldY =
                chunkY *
                CHUNK_SIZE +
                y;


            /*
                Outside actual map
            */

            if (
                worldX < 0 ||
                worldY < 0 ||
                worldX >= MAP_WIDTH ||
                worldY >= MAP_HEIGHT
            ) {

                tiles[
                    y * CHUNK_SIZE + x
                ] = TILE.WATER;

                continue;

            }


            const tileCenterX =
                worldX * TILE_SIZE +
                TILE_SIZE / 2;

            const tileCenterY =
                worldY * TILE_SIZE +
                TILE_SIZE / 2;


            const dx =
                tileCenterX -
                MAP_CENTER_X;

            const dy =
                tileCenterY -
                MAP_CENTER_Y;


            const distance =
                Math.sqrt(
                    dx * dx +
                    dy * dy
                );


            /*
                Outside circular island
            */

            if (
                distance > MAP_RADIUS
            ) {

                tiles[
                    y * CHUNK_SIZE + x
                ] = TILE.WATER;

                continue;

            }


            const r =
                hashRandom(
                    worldX,
                    worldY,
                    100
                );


            let tile =
                TILE.GRASS;


            /*
                Water
            */

            if (r < 0.10) {

                tile =
                    TILE.WATER;

            }


            /*
                Dirt
            */

            else if (r < 0.16) {

                tile =
                    TILE.DIRT;

            }


            /*
                Roads
            */

            if (
                worldX % 11 === 0 ||
                worldY % 11 === 0
            ) {

                tile =
                    TILE.ROAD;

            }


            /*
                Trees
            */

            if (
                r > 0.78 &&
                r < 0.88
            ) {

                tile =
                    TILE.TREE;

            }


            /*
                Rocks
            */

            if (
                r > 0.70 &&
                r < 0.73
            ) {

                tile =
                    TILE.ROCK;

            }


            /*
                Houses
            */

            if (r > 0.985) {

                tile =
                    TILE.HOUSE;

            }


            tiles[
                y * CHUNK_SIZE + x
            ] = tile;

        }
    }


    const chunk = {

        x: chunkX,
        y: chunkY,
        tiles: tiles

    };


    chunks.set(
        key,
        chunk
    );


    return chunk;
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
    y: MAP_CENTER_Y,

    width: 32,
    height: 46,

    speed: 230,

    color:
        randomPlayerColor(),

    direction: "down",

    moving: false,

    animationTime: 0

};


/* =====================================================
   CAMERA
===================================================== */

const camera = {

    zoom: 1,

    minZoom: 0.55,

    maxZoom: 3

};


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
        Math.sqrt(
            dx * dx +
            dy * dy
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
        `translate(${dx}px, ${dy}px)`;
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

        if (!joystickActive) return;

        if (
            event.pointerId !==
            joystickPointer
        ) return;

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
   ZOOM
===================================================== */

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


document
    .getElementById("zoomIn")
    .addEventListener(
        "pointerdown",
        () => {

            setZoom(
                camera.zoom + 0.1
            );

        }
    );


document
    .getElementById("zoomOut")
    .addEventListener(
        "pointerdown",
        () => {

            setZoom(
                camera.zoom - 0.1
            );

        }
    );


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
        ) return;


        touches.set(
            event.pointerId,
            {
                x: event.clientX,
                y: event.clientY
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
        ) return;


        if (
            !touches.has(
                event.pointerId
            )
        ) return;


        touches.set(
            event.pointerId,
            {
                x: event.clientX,
                y: event.clientY
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

        pinchDistance = null;

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
   UPDATE
===================================================== */

let lastTime =
    performance.now();


function update(time) {

    const delta =
        Math.min(
            (time - lastTime) /
            1000,
            0.05
        );


    player.animationTime +=
        delta;


    lastTime =
        time;


    let moveX = 0;
    let moveY = 0;


    /* Keyboard */

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


    /* Joystick */

    if (
        Math.abs(joystickX) > 0.05 ||
        Math.abs(joystickY) > 0.05
    ) {

        moveX = joystickX;
        moveY = joystickY;

    }


    player.moving =
        Math.abs(moveX) > 0.05 ||
        Math.abs(moveY) > 0.05;


    /* Direction */

    if (player.moving) {

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


    /* Normalize */

    const length =
        Math.sqrt(
            moveX * moveX +
            moveY * moveY
        );


    if (length > 1) {

        moveX /=
            length;

        moveY /=
            length;

    }


    /* Move */

    player.x +=
        moveX *
        player.speed *
        delta;

    player.y +=
        moveY *
        player.speed *
        delta;


    /* =================================================
       MAP BOUNDARY
    ================================================= */

    const dx =
        player.x -
        MAP_CENTER_X;

    const dy =
        player.y -
        MAP_CENTER_Y;


    const distance =
        Math.sqrt(
            dx * dx +
            dy * dy
        );


    const maxDistance =
        MAP_RADIUS - 20;


    if (
        distance > maxDistance
    ) {

        const scale =
            maxDistance /
            distance;


        player.x =
            MAP_CENTER_X +
            dx * scale;


        player.y =
            MAP_CENTER_Y +
            dy * scale;

    }

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


    const startTileX =
        Math.floor(
            cameraX /
            TILE_SIZE
        ) - 1;


    const startTileY =
        Math.floor(
            cameraY /
            TILE_SIZE
        ) - 1;


    const endTileX =
        Math.ceil(
            (
                cameraX +
                visibleWidth
            ) /
            TILE_SIZE
        ) + 1;


    const endTileY =
        Math.ceil(
            (
                cameraY +
                visibleHeight
            ) /
            TILE_SIZE
        ) + 1;


    ctx.save();


    ctx.scale(
        camera.zoom,
        camera.zoom
    );


    for (
        let tileY =
            startTileY;

        tileY <= endTileY;

        tileY++
    ) {

        for (
            let tileX =
                startTileX;

            tileX <= endTileX;

            tileX++
        ) {

            const chunkX =
                Math.floor(
                    tileX /
                    CHUNK_SIZE
                );


            const chunkY =
                Math.floor(
                    tileY /
                    CHUNK_SIZE
                );


            const localX =
                (
                    tileX %
                    CHUNK_SIZE +
                    CHUNK_SIZE
                ) %
                CHUNK_SIZE;


            const localY =
                (
                    tileY %
                    CHUNK_SIZE +
                    CHUNK_SIZE
                ) %
                CHUNK_SIZE;


            const chunk =
                generateChunk(
                    chunkX,
                    chunkY
                );


            if (!chunk) {

                continue;

            }


            const type =
                chunk.tiles[
                    localY *
                    CHUNK_SIZE +
                    localX
                ];


            const worldX =
                tileX *
                TILE_SIZE -
                cameraX;


            const worldY =
                tileY *
                TILE_SIZE -
                cameraY;


            drawTile(
                type,
                worldX,
                worldY,
                tileX,
                tileY
            );

        }
    }


    ctx.restore();

}


/* =====================================================
   DRAW PLAYER
===================================================== */

function drawPlayer() {

    const screenX =
        width / 2;

    const screenY =
        height / 2;


    let breathing = 0;


    if (!player.moving) {

        breathing =
            Math.sin(
                player.animationTime * 3
            ) * 1.2;

    }


    const scale =
        camera.zoom;


    const torsoWidth =
        22 * scale;

    const torsoHeight =
        24 * scale;

    const headRadius =
        13 * scale;


    const cx =
        screenX;

    const cy =
        screenY -
        breathing;


    ctx.save();


    /* Shadow */

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


    ctx.fillStyle =
        "rgba(0,0,0,.30)";

    ctx.fill();


    /* Legs */

    const legDistance =
        10 * scale;


    let leftRotation = 0;
    let rightRotation = 0;


    if (player.moving) {

        leftRotation =
            Math.sin(
                player.animationTime * 10
            ) * 0.45;


        rightRotation =
            Math.sin(
                player.animationTime * 10 +
                Math.PI
            ) * 0.45;

    }


    /* Left leg */

    ctx.save();

    ctx.translate(
        cx - legDistance,
        cy + 18 * scale
    );

    ctx.rotate(
        leftRotation
    );


    ctx.beginPath();

    ctx.arc(
        0,
        0,
        7 * scale,
        0,
        Math.PI * 2
    );


    ctx.fillStyle =
        "#33383D";

    ctx.fill();


    ctx.strokeStyle =
        "#17191C";

    ctx.lineWidth =
        2 * scale;

    ctx.stroke();

    ctx.restore();


    /* Right leg */

    ctx.save();

    ctx.translate(
        cx + legDistance,
        cy + 18 * scale
    );

    ctx.rotate(
        rightRotation
    );


    ctx.beginPath();

    ctx.arc(
        0,
        0,
        7 * scale,
        0,
        Math.PI * 2
    );


    ctx.fillStyle =
        "#33383D";

    ctx.fill();


    ctx.strokeStyle =
        "#17191C";

    ctx.lineWidth =
        2 * scale;

    ctx.stroke();

    ctx.restore();


    /* Torso */

    ctx.fillStyle =
        player.color;


    ctx.fillRect(
        cx - torsoWidth / 2,
        cy - 2 * scale,
        torsoWidth,
        torsoHeight
    );


    ctx.strokeStyle =
        "rgba(0,0,0,.45)";

    ctx.lineWidth =
        2 * scale;


    ctx.strokeRect(
        cx - torsoWidth / 2,
        cy - 2 * scale,
        torsoWidth,
        torsoHeight
    );


    /* Head */

    ctx.beginPath();


    ctx.arc(
        cx,
        cy - 13 * scale,
        headRadius,
        Math.PI,
        0
    );


    ctx.lineTo(
        cx + headRadius,
        cy - 4 * scale
    );


    ctx.lineTo(
        cx - headRadius,
        cy - 4 * scale
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


    /* Face */

    ctx.fillStyle =
        "#111";


    ctx.beginPath();


    ctx.arc(
        cx - 5 * scale,
        cy - 10 * scale,
        1.5 * scale,
        0,
        Math.PI * 2
    );


    ctx.arc(
        cx + 5 * scale,
        cy - 10 * scale,
        1.5 * scale,
        0,
        Math.PI * 2
    );


    ctx.fill();


    /* Name */

    ctx.font =
        `bold ${13 * scale}px Arial`;

    ctx.textAlign =
        "center";

    ctx.fillStyle =
        "white";


    ctx.fillText(
        "You",
        cx,
        cy - 29 * scale
    );


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
   MINI HAVEN CHAT — RENDER SERVER
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
            Math.random() * 9999
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

function messageId(message) {

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
   LOAD MESSAGES FROM RENDER
===================================================== */

async function loadChatMessages() {

    if (loadingChat) {

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


        if (!response.ok) {

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
                Number(a.time || 0) -
                Number(b.time || 0)
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
   ADD MESSAGE
===================================================== */

function addChatMessage(message) {

    const id =
        messageId(message);


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
        displayName + ":";


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
        message.msg || "";


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
   NAME COLOR
===================================================== */

function getChatNameColor(name) {

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
            ((hash << 5) - hash);

    }


    return colors[
        Math.abs(hash) %
        colors.length
    ];

}


/* =====================================================
   SEND MESSAGE TO RENDER
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
                SERVER_URL + "/send",
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body: JSON.stringify({

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


        if (!response.ok) {

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
   ENTER = SEND
===================================================== */

chatInput.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Enter"
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
   START RENDER CHAT
===================================================== */

loadChatMessages();


setInterval(
    loadChatMessages,
    500
);
