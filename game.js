/* =====================================================
   MINI HAVEN
   CANVAS + MULTIPLAYER + 360 AIM
===================================================== */

const canvas =
    document.getElementById("game");

const ctx =
    canvas.getContext("2d");

ctx.imageSmoothingEnabled = true;

/*multiplayer declaration*/

let multiplayerName = "";

let multiplayerId =
    crypto.randomUUID
        ? crypto.randomUUID()
        : "player-" +
          Math.random()
              .toString(36)
              .slice(2);

/* =====================================================
   MINI HAVEN LOGIN
===================================================== */

const loginScreen =
    document.getElementById("loginScreen");

const displayNameInput =
    document.getElementById("displayNameInput");

const startGameButton =
    document.getElementById("startGameButton");


let displayName = "";


/* Load saved name */

try {

    displayName =
        localStorage.getItem(
            "minihaven_display_name"
        ) || "";

} catch (error) {

    console.warn(
        "Could not load display name:",
        error
    );

}


/* Put saved name into input */


if (
    displayNameInput &&
    displayName
) {

    displayNameInput.value =
        displayName;

}


/* Start game */

function startMiniHaven() {

    const name =
        displayNameInput.value.trim();


    if (!name) {

        displayNameInput.focus();

        return;
    }


    displayName =
        name.slice(0, 20);


    /* Save name */

    try {

        localStorage.setItem(
            "minihaven_display_name",
            displayName
        );

    } catch (error) {

        console.warn(
            "Could not save display name:",
            error
        );

    }


    /* Hide login */

    if (loginScreen) {

        loginScreen.style.display =
            "none";

    }


    /* Use name for multiplayer */

    multiplayerName =
        displayName;
}


/* Start button */

if (startGameButton) {

    startGameButton.addEventListener(
        "click",
        startMiniHaven
    );

}


/* Enter key */

if (displayNameInput) {

    displayNameInput.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter"
            ) {

                startMiniHaven();

            }

        }
    );

}
/* =====================================================
   WORLD
===================================================== */

const WORLD_WIDTH = 4200;
const WORLD_HEIGHT = 3300;

const MAP_CENTER_X =
    WORLD_WIDTH / 2;

const MAP_CENTER_Y =
    WORLD_HEIGHT / 2;


function isWalkable(x, y) {
    return (
        x >= 0 &&
        x <= WORLD_WIDTH &&
        y >= 0 &&
        y <= WORLD_HEIGHT
    );
}

function rect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

function circle(x, y, radius, color) {
    ctx.fillStyle = color;

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
}

function roundRect(x, y, w, h, radius, color) {
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

/* =====================================================
   width height initialization
===================================================== */

let width = window.innerWidth;
let height = window.innerHeight;

function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;

    canvas.style.width = width + "px";
    canvas.style.height = height + "px";

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

/* =====================================================
   PNG MAP
===================================================== */

const mapImage = new Image();

mapImage.src = "./map.png";

let mapImageLoaded = false;

mapImage.onload = function () {
    mapImageLoaded = true;
};

mapImage.onerror = function () {
    console.error("Mini Haven: map.png could not be loaded.");
};



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

    speed: 300,

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

    maxZoom: 7
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
   CHAT SYSTEM
===================================================== */

const CHAT_SERVER =
    "https://my-roblox-private-chat.onrender.com";


/* =====================================================
   CHAT VARIABLES
===================================================== */

let chatUsername = "";

let chatLastMessageTime = 0;

let chatLoading = false;

let chatStarted = false;

const chatDisplayedMessages =
    new Set();


/* =====================================================
   CHAT ELEMENTS
===================================================== */

const chatToggle =
    document.getElementById("chatToggle");

const gameChat =
    document.getElementById("gameChat");

const chatMessages =
    document.getElementById("chatMessages");

const chatInput =
    document.getElementById("chatInput");

const chatSend =
    document.getElementById("chatSend");


/* =====================================================
   GET USERNAME
===================================================== */

/*
   Change this if your game already has
   a player-name variable.

   Examples:

   chatUsername = player.name;

   or

   chatUsername = playerName;
*/

function getChatUsername() {

    /*
       If your game already has a global
       playerName variable, use it.
    */

    if (
        typeof playerName !== "undefined" &&
        playerName
    ) {

        return String(playerName);

    }


    /*
       If your game has a username variable.
    */

    if (
        typeof username !== "undefined" &&
        username
    ) {

        return String(username);

    }


    
    return "Player";

}


/* =====================================================
   NAME COLORS
===================================================== */

const chatNameColors = [

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


function getChatNameColor(name) {

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


    return chatNameColors[
        Math.abs(hash) %
        chatNameColors.length
    ];

}


/* =====================================================
   MESSAGE FINGERPRINT
===================================================== */

function getChatMessageId(message) {

    return [

        String(message.time || ""),

        String(message.user || ""),

        String(message.displayName || ""),

        String(message.msg || ""),

        String(message.source || ""),

        String(message.jobId || "")

    ].join("|||");

}


/* =====================================================
   OPEN / CLOSE CHAT
===================================================== */

if (chatToggle) {

    chatToggle.addEventListener(
        "click",
        function(event) {

            event.stopPropagation();

            gameChat.classList.toggle(
                "open"
            );


            if (
                gameChat.classList.contains(
                    "open"
                )
            ) {

                chatInput.focus();

                scrollChatToBottom();

            }

        }
    );

}


/* =====================================================
   SCROLL TO BOTTOM
===================================================== */

function scrollChatToBottom() {

    requestAnimationFrame(
        function() {

            chatMessages.scrollTop =
                chatMessages.scrollHeight;

        }
    );

}


/* =====================================================
   ADD CHAT MESSAGE
===================================================== */

function addChatMessage(message) {

    const id =
        getChatMessageId(message);


    /*
       Prevent duplicates.
    */

    if (
        chatDisplayedMessages.has(id)
    ) {

        return;

    }


    chatDisplayedMessages.add(id);


    const messageTime =
        Number(message.time || 0);


    /*
       Update last message time.
    */

    if (
        messageTime >
        chatLastMessageTime
    ) {

        chatLastMessageTime =
            messageTime;

    }


    /*
       Outer message.
    */

    const wrapper =
        document.createElement(
            "div"
        );

    wrapper.className =
        "chatMessage";


    /*
       Username.
    */

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


    /*
       Message text.
    */

    const text =
        document.createElement(
            "span"
        );


    text.textContent =
        " " + (message.msg || "");


    /*
       Build message.
    */

    wrapper.appendChild(
        name
    );

    wrapper.appendChild(
        text
    );


    chatMessages.appendChild(
        wrapper
    );

showPlayerChatBubble(
    message.playerId ||
    message.user,

    message.displayName ||
    message.user,

    message.msg
);
    /*
       Keep chat at bottom if
       user is already near bottom.
    */

    const distanceFromBottom =
        chatMessages.scrollHeight -
        chatMessages.scrollTop -
        chatMessages.clientHeight;


    if (
        distanceFromBottom < 120
    ) {

        scrollChatToBottom();

    }

}



/* =====================================================
   LOAD MESSAGES
===================================================== */

async function loadChatMessages() {

    if (chatLoading) {

        return;

    }


    chatLoading = true;


    try {

        const response =
            await fetch(

                CHAT_SERVER +
                "/messages?since=" +
                encodeURIComponent(
                    chatLastMessageTime
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
                "Invalid server response"
            );

        }


        /*
           Oldest → newest.
        */

        data.sort(
            function(a, b) {

                return (
                    Number(a.time || 0) -
                    Number(b.time || 0)
                );

            }
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

        chatLoading = false;

    }

}


/* =====================================================
   SEND MESSAGE
===================================================== */

async function sendChatMessage() {

    const msg =
        chatInput.value.trim();


    if (!msg) {

        return;

    }


    if (!chatUsername) {

        chatUsername =
            getChatUsername();

    }


    if (!chatUsername) {

        return;

    }


    chatSend.disabled = true;


    try {

        const response =
            await fetch(

                CHAT_SERVER +
                "/send",

                {

                    method: "POST",

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
            "game",

        private:
            false,

        playerId:
            multiplayerId

    })


                }

            );


        if (!response.ok) {

            const errorText =
                await response.text();


            throw new Error(

                "HTTP " +
                response.status +
                " " +
                errorText

            );

        }


        const result =
            await response.json();


        /*
           Server can immediately return
           the created message.
        */

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


        scrollChatToBottom();


    } catch (error) {

        console.error(
            "Chat send error:",
            error
        );


        alert(
            "Message could not be sent."
        );


    } finally {

        chatSend.disabled = false;

    }

}


/* =====================================================
   SEND BUTTON
===================================================== */

if (chatSend) {

    chatSend.addEventListener(
        "click",
        function(event) {

            event.preventDefault();

            event.stopPropagation();

            sendChatMessage();

        }
    );

}


/* =====================================================
   ENTER TO SEND
===================================================== */

if (chatInput) {

    chatInput.addEventListener(
        "keydown",
        function(event) {

            if (
                event.key === "Enter"
            ) {

                event.preventDefault();

                sendChatMessage();

            }

        }
    );

}


/* =====================================================
   START CHAT
===================================================== */

function startGameChat() {

    if (chatStarted) {

        return;

    }


    chatStarted = true;


    chatUsername =
        getChatUsername();


    /*
       Initial message load.
    */

    loadChatMessages();


    /*
       Same 500ms polling system
       as your original chat.
    */

    setInterval(
        loadChatMessages,
        500
    );

}


/* =====================================================
   START
===================================================== */

startGameChat();       

/* =====================================================
   PLAYER CHAT BUBBLES
===================================================== */

const chatBubbles =
    document.getElementById(
        "chatBubbles"
    );

const activeChatBubbles =
    new Map();

const CHAT_BUBBLE_DURATION =
    5000;


/* =====================================================
   CREATE / UPDATE BUBBLE
===================================================== */

function showPlayerChatBubble(
    playerId,
    playerName,
    message
) {

    if (
        !chatBubbles ||
        !playerId ||
        !message
    ) {
        return;
    }


    const id =
        String(playerId);


    let bubble =
        activeChatBubbles.get(id);


    if (!bubble) {

        bubble =
            document.createElement(
                "div"
            );

        bubble.className =
            "chatBubble";


        const name =
            document.createElement(
                "span"
            );

        name.className =
            "chatBubbleName";


        const text =
            document.createElement(
                "span"
            );

        text.className =
            "chatBubbleText";


        bubble.appendChild(name);

        bubble.appendChild(text);


        chatBubbles.appendChild(
            bubble
        );


        activeChatBubbles.set(
            id,
            bubble
        );
    }


    const nameElement =
        bubble.querySelector(
            ".chatBubbleName"
        );

    const textElement =
        bubble.querySelector(
            ".chatBubbleText"
        );


    nameElement.textContent =
        playerName ||
        "Unknown";


    nameElement.style.color =
        getChatNameColor(
            playerName ||
            "Unknown"
        );


    textElement.textContent =
        message;


    bubble.style.display =
        "block";


    clearTimeout(
        bubble._removeTimer
    );


    bubble._removeTimer =
        setTimeout(
            function () {

                removePlayerChatBubble(
                    id
                );

            },
            CHAT_BUBBLE_DURATION
        );
}


/* =====================================================
   REMOVE BUBBLE
===================================================== */

function removePlayerChatBubble(
    playerId
) {

    const id =
        String(playerId);


    const bubble =
        activeChatBubbles.get(id);


    if (!bubble) {
        return;
    }


    if (
        bubble._removeTimer
    ) {

        clearTimeout(
            bubble._removeTimer
        );
    }


    bubble.remove();


    activeChatBubbles.delete(
        id
    );
}


/* =====================================================
   WORLD → SCREEN
===================================================== */

function worldToScreen(
    worldX,
    worldY
) {

    const visibleWidth =
        width / camera.zoom;

    const visibleHeight =
        height / camera.zoom;


    const cameraX =
        player.x -
        visibleWidth / 2;

    const cameraY =
        player.y -
        visibleHeight / 2;


    return {

        x:
            (
                worldX -
                cameraX
            ) *
            camera.zoom,

        y:
            (
                worldY -
                cameraY
            ) *
            camera.zoom

    };
}


/* =====================================================
   POSITION ONE BUBBLE
===================================================== */

function updateChatBubble(
    playerId,
    worldX,
    worldY
) {

    const bubble =
        activeChatBubbles.get(
            String(playerId)
        );


    if (!bubble) {
        return;
    }


    const screen =
        worldToScreen(
            worldX,
            worldY
        );


    bubble.style.left =
        `${screen.x}px`;


    bubble.style.top =
        `${screen.y - 40 * camera.zoom}px`;
}


/* =====================================================
   POSITION ALL BUBBLES
===================================================== */

function updateAllChatBubblePositions() {

    activeChatBubbles.forEach(
        function (
            bubble,
            id
        ) {

            /* LOCAL PLAYER */

            if (
                id ===
                String(multiplayerId)
            ) {

                updateChatBubble(
                    id,
                    player.x,
                    player.y
                );

                return;
            }


            /* REMOTE PLAYER */

            const remote =
                remotePlayers.get(id);


            if (remote) {

                updateChatBubble(
                    id,
                    remote.x,
                    remote.y
                );
            }

        }
    );
}


/* =====================================================
   CLEAR ALL
===================================================== */

function clearChatBubbles() {

    activeChatBubbles.forEach(
        function (bubble) {

            if (
                bubble._removeTimer
            ) {

                clearTimeout(
                    bubble._removeTimer
                );
            }


            bubble.remove();

        }
    );


    activeChatBubbles.clear();
}

/* =====================================================
   MULTIPLAYER
===================================================== */

const MULTIPLAYER_URL =
    "wss://mini-haven-cloudfare-server.umeshjamre321.workers.dev/game?room=main";


let socket = null;

let multiplayerConnected =
    false;


try {

    multiplayerName =
        localStorage.getItem(
            "minihaven_display_name"
        ) || "";

} catch {}

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


/* =====================================================
   DRAW WORLD
===================================================== */

function drawWorld() {

    const visibleWidth =
        width / camera.zoom;

    const visibleHeight =
        height / camera.zoom;


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


    /* =================================================
       DARK GREY WORLD BACKGROUND
    ================================================= */

    ctx.fillStyle =
        "#3a3a3a";

    ctx.fillRect(
        0,
        0,
        WORLD_WIDTH,
        WORLD_HEIGHT
    );


    /* =================================================
       TRANSPARENT PNG MAP
    ================================================= */

    if (mapImageLoaded) {

        ctx.drawImage(
            mapImage,

            0,
            0,

            WORLD_WIDTH,
            WORLD_HEIGHT
        );


        /* =================================================
           MAP UI-STROKE STYLE OUTLINE
        ================================================= */

        ctx.strokeStyle =
            "#101010";

        ctx.lineWidth =
            12;

        ctx.strokeRect(
            0,
            0,
            WORLD_WIDTH,
            WORLD_HEIGHT
        );
    }


    ctx.restore();


    /* =================================================
       PLAYERS
    ================================================= */

    drawRemotePlayers(
        cameraX,
        cameraY
    );


    drawPlayer();


    /* =================================================
       CHAT BUBBLES
    ================================================= */

    updateAllChatBubblePositions();
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

if (displayName) {

    if (loginScreen) {
        loginScreen.style.display = "none";
    }

    if (!multiplayerConnected) {
    connectMultiplayer();
}
}
