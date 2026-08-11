const canvas =
    document.getElementById("game");

const ctx =
    canvas.getContext("2d");


/* =====================================================
   SETTINGS
===================================================== */

const TILE_SIZE = 32;

const CHUNK_SIZE = 16;

const CHUNK_WORLD_SIZE =
    TILE_SIZE * CHUNK_SIZE;


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

/*
    Every tile is made from tiny blocks.

    We render a 4 × 4 visual grid
    inside each 32 × 32 tile.
*/

const VISUAL_GRID = 4;

const BLOCK_SIZE =
    TILE_SIZE / VISUAL_GRID;


/* =====================================================
   TILE BASE COLORS
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

    return n -
        Math.floor(n);
}


/* =====================================================
   DRAW SMALL BLOCK
===================================================== */

function block(
    color,
    x,
    y,
    size = BLOCK_SIZE
) {

    ctx.fillStyle =
        color;

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

            if (random < .15) {

                block(
                    COLORS.grassDark,
                    x + bx * BLOCK_SIZE,
                    y + by * BLOCK_SIZE
                );

            } else if (
                random > .88
            ) {

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

            if (random < .18) {

                block(
                    COLORS.waterDark,
                    x + bx * BLOCK_SIZE,
                    y + by * BLOCK_SIZE
                );

            } else if (
                random > .86
            ) {

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

            if (random < .18) {

                block(
                    COLORS.dirtDark,
                    x + bx * BLOCK_SIZE,
                    y + by * BLOCK_SIZE
                );

            } else if (
                random > .88
            ) {

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

            if (random < .15) {

                block(
                    COLORS.roadDark,
                    x + bx * BLOCK_SIZE,
                    y + by * BLOCK_SIZE
                );

            } else if (
                random > .9
            ) {

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

function drawTree(
    x,
    y
) {

    /*
        Ground
    */

    block(
        COLORS.grass,
        x,
        y,
        TILE_SIZE
    );


    /*
        Trunk
    */

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


    /*
        Leaves
    */

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

function drawRock(
    x,
    y
) {

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

function drawHouse(
    x,
    y
) {

    /*
        Ground
    */

    block(
        COLORS.grass,
        x,
        y,
        TILE_SIZE
    );


    /*
        Building
    */

    block(
        COLORS.wall,
        x + 4,
        y + 10,
        24
    );


    /*
        Roof
    */

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


    /*
        Door
    */

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

            drawTree(
                x,
                y
            );

            break;


        case TILE.ROCK:

            drawRock(
                x,
                y
            );

            break;


        case TILE.HOUSE:

            drawHouse(
                x,
                y
            );

            break;
    }
}


/* =====================================================
   CHUNKS
===================================================== */

const chunks =
    new Map();


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


    if (
        chunks.has(key)
    ) {

        return chunks.get(key);
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
                Deterministic random
            */

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

            if (
                r < .10
            ) {

                tile =
                    TILE.WATER;

            }


            /*
                Dirt
            */

            else if (
                r < .16
            ) {

                tile =
                    TILE.DIRT;

            }


            /*
                Road
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
                r > .78 &&
                r < .88
            ) {

                tile =
                    TILE.TREE;

            }


            /*
                Rocks
            */

            if (
                r > .70 &&
                r < .73
            ) {

                tile =
                    TILE.ROCK;

            }


            /*
                Houses
            */

            if (
                r > .985
            ) {

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

        tiles
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

const player = {

    x: 0,

    y: 0,

    radius: 14,

    speed: 230,

    color: "#4da6ff"
};


/* =====================================================
   CAMERA
===================================================== */

const camera = {

    zoom: 1,

    minZoom: .55,

    maxZoom: 2.5
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


let joystickActive =
    false;

let joystickPointer =
    null;

let joystickX = 0;
let joystickY = 0;


const JOYSTICK_RADIUS =
    55;


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

    joystickActive =
        false;

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
        ) return;

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

let pinchDistance =
    null;

let pinchZoom =
    1;


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
   UPDATE
===================================================== */

let lastTime =
    performance.now();


function update(time) {

    const delta =
        Math.min(
            (time - lastTime) /
            1000,

            .05
        );


    lastTime =
        time;


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
        Math.sqrt(
            moveX * moveX +
            moveY * moveY
        );


    if (
        length > 1
    ) {

        moveX /=
            length;

        moveY /=
            length;
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
}


/* =====================================================
   DRAW WORLD
===================================================== */

function drawWorld() {

    /*
        Visible world area
    */

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


    /*
        Draw only visible tiles
    */

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


            /*
                Find chunk
            */

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

    /*
        Player is always screen center.
    */

    const screenX =
        width / 2;

    const screenY =
        height / 2;


    /*
        Shadow
    */

    ctx.beginPath();

    ctx.arc(
        screenX + 2,
        screenY + 3,
        player.radius *
        camera.zoom,

        0,
        Math.PI * 2
    );


    ctx.fillStyle =
        "rgba(0,0,0,.35)";

    ctx.fill();


    /*
        Player
    */

    ctx.beginPath();

    ctx.arc(
        screenX,
        screenY,
        player.radius *
        camera.zoom,

        0,
        Math.PI * 2
    );


    ctx.fillStyle =
        player.color;

    ctx.fill();


    /*
        Outline
    */

    ctx.lineWidth = 3;

    ctx.strokeStyle =
        "white";

    ctx.stroke();


    /*
        Name
    */

    ctx.font =
        "bold 13px Arial";

    ctx.textAlign =
        "center";

    ctx.fillStyle =
        "white";

    ctx.fillText(
        "You",

        screenX,

        screenY -
        player.radius *
        camera.zoom -
        10
    );
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
