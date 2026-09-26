import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import "./App.css";

const socket = io("https://buzzer-arena.onrender.com");

// =========================
// ICONS
// =========================

function GameIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M8 6h8l3 4v6H5v-6l3-4Z" />
      <path d="M8 10v4M6 12h4" />
      <circle cx="16" cy="11" r="1" />
      <circle cx="18" cy="13" r="1" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3-6 8-6s8 2 8 6" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M12 3 20 6v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function KeyIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <circle cx="8" cy="15" r="4" />
      <path d="m11 12 8-8M16 6l2 2M14 8l2 2" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M19 12H5M11 18l-6-6 6-6" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <circle cx="9" cy="8" r="3" />
      <path d="M3 19c0-3 2-5 6-5s6 2 6 5" />
      <path d="M16 5c2 0 3 1 3 3s-1 3-3 3M17 14c3 0 4 2 4 5" />
    </svg>
  );
}

function BoltIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />
    </svg>
  );
}

function RotateIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M4 12a8 8 0 0 1 14-5l2 2" />
      <path d="M20 4v5h-5" />
      <path d="M20 12a8 8 0 0 1-14 5l-2-2" />
      <path d="M4 20v-5h5" />
    </svg>
  );
}

function TrophyIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M8 4h8v5c0 3-2 5-4 5s-4-2-4-5V4Z" />
      <path d="M8 6H4v2c0 3 2 4 4 4M16 6h4v2c0 3-2 4-4 4" />
      <path d="M12 14v4M8 21h8M9 18h6" />
    </svg>
  );
}

function TopicIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M4 5h16v14H4z" />
      <path d="M8 9h8M8 13h6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function App() {
  const [page, setPage] = useState("home");

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [loggedUser, setLoggedUser] =
    useState(null);

  const [adminName, setAdminName] =
    useState("");

  const [adminPassword, setAdminPassword] =
    useState("");

  const [adminMessage, setAdminMessage] =
    useState("");

  const [gameCode, setGameCode] =
    useState(null);

  const [eventTopic, setEventTopic] =
    useState("");

  const [topicInput, setTopicInput] =
    useState("");

  const [users, setUsers] =
    useState([]);

  const [buzzOrder, setBuzzOrder] =
    useState([]);

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    socket.on("gameState", (data) => {
      setGameCode(data.gameCode);
      setEventTopic(
        data.eventTopic || ""
      );
      setUsers(data.users || []);
      setBuzzOrder(
        data.buzzOrder || []
      );
    });

    socket.on("loginSuccess", (data) => {
      setLoggedUser(data.user);
      setPage("user");
      setMessage("");
    });

    socket.on("loginError", (data) => {
      setMessage(data.message);
    });

    socket.on(
      "adminLoginSuccess",
      () => {
        setAdminMessage("");
        setPage("admin");
      }
    );

    socket.on(
      "adminLoginError",
      (data) => {
        setAdminMessage(
          data.message
        );
      }
    );

    return () => {
      socket.off("gameState");
      socket.off("loginSuccess");
      socket.off("loginError");
      socket.off(
        "adminLoginSuccess"
      );
      socket.off(
        "adminLoginError"
      );
    };
  }, []);

  function loginUser(e) {
    e.preventDefault();

    if (!name.trim()) {
      setMessage("Enter your name");
      return;
    }

    if (!code.trim()) {
      setMessage("Enter game code");
      return;
    }

    socket.emit("userLogin", {
      name,
      code
    });
  }

  function loginAdmin(e) {
    e.preventDefault();

    if (!adminName.trim()) {
      setAdminMessage(
        "Enter admin name"
      );
      return;
    }

    if (!adminPassword.trim()) {
      setAdminMessage(
        "Enter admin password"
      );
      return;
    }

    socket.emit("adminLogin", {
      name: adminName,
      password: adminPassword
    });
  }

  function pressBuzzer() {
    socket.emit("buzz");
  }

  function createGame() {
    const topic =
      topicInput.trim() ||
      "Buzzer Event";

    socket.emit("createGame", {
      topic
    });
  }

  function updateTopic() {
    const topic =
      topicInput.trim();

    if (!topic) return;

    socket.emit("updateTopic", {
      topic
    });
  }

  function resetGame() {
    socket.emit("resetGame");
  }

  // =========================
  // USER EXIT
  // =========================

  function exitUser() {
    setLoggedUser(null);
    setName("");
    setCode("");
    setMessage("");
    setPage("login");
  }

  // =========================
  // HOME
  // =========================

  if (page === "home") {
    return (
      <div className="app home-page">
        <div className="home-container">

          <div className="brand-icon">
            <GameIcon />
          </div>

          <div className="home-title">
            <span className="eyebrow">
              REAL-TIME MULTIPLAYER
            </span>

            <h1>
              BUZZER
              <span>ARENA</span>
            </h1>

            <p>
              Fast. Live. Competitive.
            </p>
          </div>

          <div className="home-buttons">

            <button
              className="primary-button home-button"
              onClick={() =>
                setPage("login")
              }
            >
              <UserIcon />
              USER LOGIN
            </button>

            <button
              className="secondary-button home-button"
              onClick={() => {
                setAdminMessage("");
                setPage(
                  "adminLogin"
                );
              }}
            >
              <ShieldIcon />
              ADMIN PANEL
            </button>

          </div>

          <div className="home-footer">
            <span className="live-dot"></span>
            LIVE MULTIPLAYER SYSTEM
          </div>

        </div>
      </div>
    );
  }

  // =========================
  // USER LOGIN
  // =========================

  if (page === "login") {
    return (
      <div className="app auth-page">
        <div className="card login-card">

          <div className="card-heading">
            <div className="heading-icon">
              <UserIcon />
            </div>

            <div>
              <span className="section-label">
                PLAYER ACCESS
              </span>

              <h2>
                USER LOGIN
              </h2>

              <p>
                Join the live
                buzzer event
              </p>
            </div>
          </div>

          <form
            onSubmit={loginUser}
          >

            <div className="input-group">
              <label>
                PLAYER NAME
              </label>

              <div className="input-wrapper">
                <UserIcon />

                <input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) =>
                    setName(
                      e.target.value
                    )
                  }
                />
              </div>
            </div>

            <div className="input-group">
              <label>
                GAME CODE
              </label>

              <div className="input-wrapper">
                <KeyIcon />

                <input
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={code}
                  onChange={(e) =>
                    setCode(
                      e.target.value
                    )
                  }
                />
              </div>
            </div>

            <button
              className="primary-button full-button"
              type="submit"
            >
              JOIN GAME
            </button>

          </form>

          {message && (
            <div className="message-box error">
              {message}
            </div>
          )}

          <button
            className="back-button"
            onClick={() => {
              setMessage("");
              setPage("home");
            }}
          >
            <ArrowIcon />
            BACK TO HOME
          </button>

        </div>
      </div>
    );
  }

  // =========================
  // ADMIN LOGIN
  // =========================

  if (page === "adminLogin") {
    return (
      <div className="app auth-page">
        <div className="card login-card">

          <div className="card-heading">
            <div className="heading-icon admin-icon">
              <ShieldIcon />
            </div>

            <div>
              <span className="section-label">
                CONTROL CENTER
              </span>

              <h2>
                ADMIN LOGIN
              </h2>

              <p>
                Manage your live
                buzzer event
              </p>
            </div>
          </div>

          <form
            onSubmit={loginAdmin}
          >

            <div className="input-group">
              <label>
                ADMIN NAME
              </label>

              <div className="input-wrapper">
                <UserIcon />

                <input
                  type="text"
                  placeholder="Enter admin name"
                  value={adminName}
                  onChange={(e) =>
                    setAdminName(
                      e.target.value
                    )
                  }
                />
              </div>
            </div>

            <div className="input-group">
              <label>
                PASSWORD
              </label>

              <div className="input-wrapper">
                <KeyIcon />

                <input
                  type="password"
                  placeholder="Admin name + 0000"
                  value={
                    adminPassword
                  }
                  onChange={(e) =>
                    setAdminPassword(
                      e.target.value
                    )
                  }
                />
              </div>
            </div>

            <button
              className="primary-button full-button"
              type="submit"
            >
              <ShieldIcon />
              LOGIN TO ADMIN PANEL
            </button>

          </form>

          {adminMessage && (
            <div className="message-box error">
              {adminMessage}
            </div>
          )}

          <button
            className="back-button"
            onClick={() => {
              setAdminName("");
              setAdminPassword("");
              setAdminMessage("");
              setPage("home");
            }}
          >
            <ArrowIcon />
            BACK TO HOME
          </button>

        </div>
      </div>
    );
  }

  // =========================
  // USER PAGE
  // =========================

  if (page === "user") {
    const currentUser =
      users.find(
        (user) =>
          user.id === socket.id
      );

    const hasBuzzed =
      currentUser?.buzzed || false;

    return (
      <div className="app user-page">

        <div className="user-container">

          {/* TOP BAR */}

          <div className="user-topbar">

            <div className="user-profile">
              <div className="mini-icon">
                <UserIcon />
              </div>

              <div>
                <span>
                  PLAYER
                </span>

                <strong>
                  {loggedUser?.name}
                </strong>
              </div>
            </div>

            <div className="user-top-actions">

              <div className="live-badge">
                <span className="live-dot"></span>
                LIVE
              </div>

              <button
                className="user-exit"
                onClick={
                  exitUser
                }
              >
                <ArrowIcon />
                EXIT
              </button>

            </div>

          </div>

          {/* EVENT */}

          <div className="user-event-card">

            <div className="event-topic-label">
              <TopicIcon />
              EVENT TOPIC
            </div>

            <h1>
              {eventTopic ||
                "Buzzer Event"}
            </h1>

            <div className="game-code-small">
              GAME CODE:
              <strong>
                {gameCode ||
                  "------"}
              </strong>
            </div>

          </div>

          {/* BUZZER */}

          <div className="buzzer-section">

            <div
              className={`buzzer ${hasBuzzed
                ? "buzzed"
                : ""
                }`}
              onClick={
                hasBuzzed
                  ? undefined
                  : pressBuzzer
              }
            >
              <div className="buzzer-inner">
                <BoltIcon />

                <span>
                  {hasBuzzed
                    ? "BUZZED"
                    : "BUZZ"}
                </span>
              </div>
            </div>

            <p className="buzzer-status">
              {hasBuzzed ? (
                <>
                  <CheckIcon />
                  Your buzzer
                  has been
                  registered
                </>
              ) : (
                <>
                  <BoltIcon />
                  Press when
                  you know the
                  answer
                </>
              )}
            </p>

          </div>

          {/* PLAYERS */}

          <div className="players-card">

            <div className="players-card-header">

              <div>
                <span className="section-label">
                  LIVE STATUS
                </span>

                <h2>
                  PLAYERS
                </h2>
              </div>

              <div className="count-badge">
                {users.length}
              </div>

            </div>

            <div className="player-list">

              {users.map(
                (user) => (
                  <div
                    className="player-row"
                    key={
                      user.id
                    }
                  >

                    <div className="player-info">

                      <div className="player-avatar">
                        <UserIcon />
                      </div>

                      <strong>
                        {
                          user.name
                        }
                      </strong>

                    </div>

                    <div
                      className={
                        user.buzzed
                          ? "status buzzed-status"
                          : "status ready-status"
                      }
                    >
                      <span></span>

                      {user.buzzed
                        ? "BUZZED"
                        : "READY"}
                    </div>

                  </div>
                )
              )}

              {users.length ===
                0 && (
                  <div className="empty">
                    Waiting for
                    players...
                  </div>
                )}

            </div>

          </div>

        </div>

      </div>
    );
  }

  // =========================
  // ADMIN PAGE
  // =========================

  if (page === "admin") {
    return (
      <div className="app admin-page">

        <div className="admin-container">

          {/* HEADER */}

          <div className="admin-topbar">

            <div className="admin-brand">

              <div className="admin-brand-icon">
                <ShieldIcon />
              </div>

              <div>
                <span>
                  CONTROL CENTER
                </span>

                <h1>
                  ADMIN PANEL
                </h1>
              </div>

            </div>

            <div className="admin-actions">

              <button
                className="create-button"
                onClick={
                  createGame
                }
              >
                <GameIcon />
                CREATE
              </button>

              <button
                className="reset-button"
                onClick={
                  resetGame
                }
              >
                <RotateIcon />
                RESET
              </button>

              <button
                className="admin-back-button"
                onClick={() =>
                  setPage(
                    "home"
                  )
                }
              >
                <ArrowIcon />
                EXIT
              </button>

            </div>

          </div>

          {/* EVENT SETUP */}

          <div className="setup-card">

            <div className="setup-heading">

              <div className="setup-icon">
                <TopicIcon />
              </div>

              <div>
                <span className="section-label">
                  EVENT SETUP
                </span>

                <h2>
                  Event Topic
                </h2>

                <p>
                  Topic shown to
                  all players.
                </p>
              </div>

            </div>

            <div className="topic-controls">

              <input
                type="text"
                placeholder="Example: General Knowledge Quiz"
                value={
                  topicInput
                }
                onChange={(e) =>
                  setTopicInput(
                    e.target.value
                  )
                }
              />

              <button
                className="topic-button"
                onClick={
                  gameCode
                    ? updateTopic
                    : createGame
                }
              >
                <CheckIcon />

                {gameCode
                  ? "UPDATE"
                  : "CREATE"}
              </button>

            </div>

            {eventTopic && (
              <div className="current-topic">
                <span>
                  CURRENT TOPIC
                </span>

                <strong>
                  {eventTopic}
                </strong>
              </div>
            )}

          </div>

          {/* GAME CODE */}

          <div className="code-card">

            <div className="code-icon">
              <KeyIcon />
            </div>

            <div>
              <span>
                CURRENT GAME CODE
              </span>

              <strong>
                {gameCode ||
                  "NO ACTIVE GAME"}
              </strong>
            </div>

            <div className="game-status">
              <span></span>

              {gameCode
                ? "ACTIVE"
                : "WAITING"}
            </div>

          </div>

          {/* MAIN GRID */}

          <div className="admin-grid">

            {/* PLAYERS */}

            <div className="admin-panel">

              <div className="panel-header">

                <div className="panel-title">
                  <UsersIcon />

                  <div>
                    <span>
                      LIVE
                      CONNECTIONS
                    </span>

                    <h2>
                      PLAYERS
                    </h2>
                  </div>
                </div>

                <div className="panel-count">
                  {
                    users.length
                  }
                </div>

              </div>

              <div className="admin-player-list">

                {users.length ===
                  0 && (
                    <div className="empty">
                      No players
                      connected
                    </div>
                  )}

                {users.map(
                  (user) => {

                    const buzz =
                      buzzOrder.find(
                        (
                          b
                        ) =>
                          b.id ===
                          user.id
                      );

                    return (
                      <div
                        className={
                          user.buzzed
                            ? "admin-player buzzed-player"
                            : "admin-player"
                        }
                        key={
                          user.id
                        }
                      >

                        <div className="admin-player-main">

                          <div className="player-avatar">
                            <UserIcon />
                          </div>

                          <div>

                            <strong>
                              {
                                user.name
                              }
                            </strong>

                            <span
                              className={
                                user.buzzed
                                  ? "player-state buzzed-state"
                                  : "player-state"
                              }
                            >
                              <span></span>

                              {user.buzzed
                                ? "BUZZED"
                                : "READY"}
                            </span>

                          </div>

                        </div>

                        {buzz && (
                          <div className="position-badge">
                            #
                            {
                              buzz.position
                            }
                          </div>
                        )}

                      </div>
                    );
                  }
                )}

              </div>

            </div>

            {/* BUZZ ORDER */}

            <div className="admin-panel">

              <div className="panel-header">

                <div className="panel-title">
                  <TrophyIcon />

                  <div>
                    <span>
                      REAL-TIME
                      RESULTS
                    </span>

                    <h2>
                      BUZZER ORDER
                    </h2>
                  </div>
                </div>

                <div className="panel-count">
                  {
                    buzzOrder.length
                  }
                </div>

              </div>

              <div className="buzz-order-list">

                {buzzOrder.length ===
                  0 && (
                    <div className="waiting-box">
                      <BoltIcon />

                      <strong>
                        Waiting for
                        first buzz
                      </strong>

                      <span>
                        Results will
                        appear here
                        instantly.
                      </span>
                    </div>
                  )}

                {buzzOrder.map(
                  (buzz) => (
                    <div
                      className="buzz-row"
                      key={
                        buzz.id
                      }
                    >

                      <div className="rank">
                        {
                          buzz.position
                        }
                      </div>

                      <div className="buzz-player-icon">
                        <UserIcon />
                      </div>

                      <div className="buzz-player-name">
                        <strong>
                          {
                            buzz.name
                          }
                        </strong>

                        <span>
                          BUZZED
                        </span>
                      </div>

                      <BoltIcon />

                    </div>
                  )
                )}

              </div>

            </div>

          </div>

        </div>

      </div>
    );
  }

  return null;
}

export default App;