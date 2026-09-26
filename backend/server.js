const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
require("dotenv").config();

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;

// =========================
// EXPRESS SETUP
// =========================

app.use(cors());
app.use(express.json());

// =========================
// SOCKET.IO SETUP
// =========================

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// =========================
// GAME DATA
// =========================

let gameCode = null;
let eventTopic = "";
let users = [];
let buzzOrder = [];
let gameStarted = false;

// =========================
// GENERATE GAME CODE
// =========================

function generateGameCode() {
    return Math.floor(
        100000 + Math.random() * 900000
    ).toString();
}

// =========================
// SEND GAME STATE
// =========================

function sendGameState() {
    io.emit("gameState", {
        gameCode: gameCode,
        eventTopic: eventTopic,
        users: users,
        buzzOrder: buzzOrder,
        gameStarted: gameStarted
    });
}

// =========================
// HOME ROUTE
// =========================

app.get("/", (req, res) => {
    res.send(
        "Real-Time Buzzer Game Backend Running"
    );
});

// =========================
// SOCKET CONNECTION
// =========================

io.on("connection", (socket) => {

    console.log(
        "Device connected:",
        socket.id
    );

    // =========================
    // ADMIN LOGIN
    // =========================

    socket.on(
        "adminLogin",
        ({ name, password }) => {

            if (
                !name ||
                !name.trim()
            ) {
                socket.emit(
                    "adminLoginError",
                    {
                        message:
                            "Enter admin name."
                    }
                );

                return;
            }

            if (
                !password ||
                !password.trim()
            ) {
                socket.emit(
                    "adminLoginError",
                    {
                        message:
                            "Enter admin password."
                    }
                );

                return;
            }

            const enteredName =
                name
                    .trim()
                    .toLowerCase();

            const enteredPassword =
                password.trim();

            // Password rule:
            // admin name + 0000
            //
            // Example:
            // kavin -> kavin0000
            // nivak -> nivak0000

            const expectedPassword =
                `${enteredName}0000`;

            if (
                enteredPassword ===
                expectedPassword
            ) {

                console.log(
                    "Admin logged in:",
                    enteredName
                );

                socket.emit(
                    "adminLoginSuccess"
                );

            } else {

                socket.emit(
                    "adminLoginError",
                    {
                        message:
                            "Invalid admin name or password."
                    }
                );
            }
        }
    );

    // =========================
    // CREATE GAME
    // =========================

    socket.on(
        "createGame",
        ({ topic } = {}) => {

            gameCode =
                generateGameCode();

            // Store topic
            if (
                topic &&
                topic.trim()
            ) {
                eventTopic =
                    topic.trim();
            } else {
                eventTopic =
                    "Buzzer Event";
            }

            // Clear old players
            users = [];

            // Clear old buzzer order
            buzzOrder = [];

            // Start game
            gameStarted = true;

            console.log(
                "=============================="
            );

            console.log(
                "NEW GAME CREATED"
            );

            console.log(
                "Game Code:",
                gameCode
            );

            console.log(
                "Event Topic:",
                eventTopic
            );

            console.log(
                "=============================="
            );

            // Send topic + code + players
            // to every connected device
            sendGameState();
        }
    );

    // =========================
    // UPDATE EVENT TOPIC
    // =========================

    socket.on(
        "updateTopic",
        ({ topic } = {}) => {

            // No active game
            if (!gameCode) {
                return;
            }

            // Empty topic
            if (
                !topic ||
                !topic.trim()
            ) {
                return;
            }

            eventTopic =
                topic.trim();

            console.log(
                "Event topic updated:",
                eventTopic
            );

            // Send updated topic
            // to all users immediately
            sendGameState();
        }
    );

    // =========================
    // USER LOGIN
    // =========================

    socket.on(
        "userLogin",
        ({ name, code }) => {

            // Check game exists
            if (!gameCode) {

                socket.emit(
                    "loginError",
                    {
                        message:
                            "No active game. Ask admin to create a game."
                    }
                );

                return;
            }

            // Check game code
            if (
                String(code).trim() !==
                String(gameCode).trim()
            ) {

                socket.emit(
                    "loginError",
                    {
                        message:
                            "Invalid game code."
                    }
                );

                return;
            }

            // Check name
            if (
                !name ||
                !name.trim()
            ) {

                socket.emit(
                    "loginError",
                    {
                        message:
                            "Please enter your name."
                    }
                );

                return;
            }

            const cleanName =
                name.trim();

            // Check duplicate name
            const alreadyExists =
                users.some(
                    (user) =>
                        user.name
                            .toLowerCase() ===
                        cleanName
                            .toLowerCase()
                );

            if (alreadyExists) {

                socket.emit(
                    "loginError",
                    {
                        message:
                            "This name is already used."
                    }
                );

                return;
            }

            // Create user
            const user = {
                id: socket.id,
                name: cleanName,
                buzzed: false
            };

            users.push(user);

            console.log(
                cleanName,
                "joined the game"
            );

            // Tell only this user
            // that login was successful
            socket.emit(
                "loginSuccess",
                {
                    user: user
                }
            );

            // Send updated state
            // to admin + all users
            sendGameState();
        }
    );

    // =========================
    // BUZZER
    // =========================

    socket.on(
        "buzz",
        () => {

            const user =
                users.find(
                    (u) =>
                        u.id ===
                        socket.id
                );

            // User not found
            if (!user) {
                return;
            }

            // User already buzzed
            if (user.buzzed) {
                return;
            }

            // Mark user as buzzed
            user.buzzed = true;

            // Position
            const position =
                buzzOrder.length + 1;

            const buzzData = {
                id: user.id,
                name: user.name,
                position: position
            };

            // Add to buzzer order
            buzzOrder.push(
                buzzData
            );

            console.log(
                "BUZZ:",
                user.name,
                "| Position:",
                position
            );

            // Update everybody
            sendGameState();
        }
    );

    // =========================
    // RESET GAME
    // =========================

    socket.on(
        "resetGame",
        () => {

            console.log(
                "GAME RESET"
            );

            // Clear buzzer order
            buzzOrder = [];

            // Make every player ready
            users =
                users.map(
                    (user) => ({
                        ...user,
                        buzzed: false
                    })
                );

            // Send updated state
            sendGameState();
        }
    );

    // =========================
    // USER LEAVE GAME
    // =========================

    socket.on(
        "leaveGame",
        () => {

            console.log(
                "User leaving:",
                socket.id
            );

            const user =
                users.find(
                    (u) =>
                        u.id ===
                        socket.id
                );

            if (!user) {
                return;
            }

            // Remove user
            users =
                users.filter(
                    (u) =>
                        u.id !==
                        socket.id
                );

            // Remove from buzzer order
            buzzOrder =
                buzzOrder.filter(
                    (b) =>
                        b.id !==
                        socket.id
                );

            // Recalculate positions
            buzzOrder =
                buzzOrder.map(
                    (
                        buzz,
                        index
                    ) => ({
                        ...buzz,
                        position:
                            index + 1
                    })
                );

            console.log(
                user.name,
                "left the game"
            );

            sendGameState();
        }
    );

    // =========================
    // DISCONNECT
    // =========================

    socket.on(
        "disconnect",
        () => {

            console.log(
                "Device disconnected:",
                socket.id
            );

            const user =
                users.find(
                    (u) =>
                        u.id ===
                        socket.id
                );

            // If this socket belongs
            // to a player
            if (user) {

                // Remove player
                users =
                    users.filter(
                        (u) =>
                            u.id !==
                            socket.id
                    );

                // Remove buzzer entry
                buzzOrder =
                    buzzOrder.filter(
                        (b) =>
                            b.id !==
                            socket.id
                    );

                // Recalculate positions
                buzzOrder =
                    buzzOrder.map(
                        (
                            buzz,
                            index
                        ) => ({
                            ...buzz,
                            position:
                                index + 1
                        })
                    );

                console.log(
                    user.name,
                    "disconnected"
                );

                sendGameState();
            }
        }
    );
});

// =========================
// START SERVER
// =========================

server.listen(
    PORT,
    () => {

        console.log(
            "================================"
        );

        console.log(
            `Buzzer server running on http://localhost:${PORT}`
        );

        console.log(
            "================================"
        );
    }
);