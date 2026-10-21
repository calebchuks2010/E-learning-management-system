(function() {
    const teacherForm = document.getElementById("teacherVideoCallForm");
    const studentForm = document.getElementById("studentVideoCallForm");
    const isTeacher = Boolean(teacherForm);

    if (!teacherForm && !studentForm) {
        return;
    }

    const loggedIn = localStorage.getItem(isTeacher ? "teacherLoggedIn" : "loggedIn") === "true";
    const username = localStorage.getItem(isTeacher ? "teacherUsername" : "username");

    if (!loggedIn || !username) {
        return;
    }

    const storageKey = "cclassVideoSessions";
    const list = document.getElementById(isTeacher ? "teacherVideoCallList" : "studentVideoCallList");
    const status = document.getElementById(isTeacher ? "teacherVideoCallStatus" : "studentVideoCallStatus");

    function readSessions() {
        try {
            const sessions = JSON.parse(localStorage.getItem(storageKey) || "[]");
            if (!Array.isArray(sessions)) {
                throw new Error("Saved video classes are not in the expected format.");
            }
            return sessions;
        } catch (error) {
            status.textContent = "Video classes could not be loaded. Please check your browser storage and refresh.";
            return [];
        }
    }

    function saveSessions(sessions) {
        try {
            localStorage.setItem(storageKey, JSON.stringify(sessions));
            return true;
        } catch (error) {
            status.textContent = "This video class could not be saved. Check that browser storage is available.";
            return false;
        }
    }

    function makeRoomCode() {
        const alphabet = "abcdefghjkmnpqrstuvwxyz23456789";
        const values = new Uint8Array(20);

        if (window.crypto && window.crypto.getRandomValues) {
            window.crypto.getRandomValues(values);
        } else {
            for (let index = 0; index < values.length; index += 1) {
                values[index] = Math.floor(Math.random() * 256);
            }
        }

        return "cclass-" + Array.from(values, function(value) {
            return alphabet[value % alphabet.length];
        }).join("");
    }

    function openRoom(roomCode) {
        const roomUrl = "https://meet.jit.si/" + encodeURIComponent(roomCode);
        window.open(roomUrl, "_blank", "noopener,noreferrer");
    }

    function createTextElement(tagName, className, text) {
        const element = document.createElement(tagName);
        element.className = className;
        element.textContent = text;
        return element;
    }

    function renderSessions() {
        const sessions = readSessions().filter(function(session) {
            if (!session || session.status === "completed") {
                return false;
            }
            return !isTeacher || session.teacherUsername === username;
        }).sort(function(first, second) {
            const firstTime = first.scheduledAt ? new Date(first.scheduledAt).getTime() : new Date(first.createdAt).getTime();
            const secondTime = second.scheduledAt ? new Date(second.scheduledAt).getTime() : new Date(second.createdAt).getTime();
            return firstTime - secondTime;
        });

        list.replaceChildren();

        if (sessions.length === 0) {
            list.appendChild(createTextElement(
                "p",
                "video-call-empty",
                isTeacher ? "You have no video classes yet. Create one above to get started." : "No video classes have been shared here yet. Ask your teacher for a room code to join."
            ));
            return;
        }

        sessions.forEach(function(session) {
            const card = document.createElement("article");
            card.className = "video-call-item";

            const details = document.createElement("div");
            details.className = "video-call-details";
            details.appendChild(createTextElement("h3", "", session.title || "Video class"));
            details.appendChild(createTextElement("p", "", "Teacher: " + (session.teacherUsername || "Teacher")));

            if (session.scheduledAt) {
                const time = new Date(session.scheduledAt);
                details.appendChild(createTextElement("p", "", "Scheduled: " + time.toLocaleString()));
            }

            details.appendChild(createTextElement("p", "video-call-code", "Room code: " + session.roomCode));
            const sessionStatus = session.status === "live" ? "Live now" : "Scheduled";
            const badge = createTextElement("span", "video-call-status" + (session.status === "live" ? " video-call-status-live" : ""), sessionStatus);
            details.appendChild(badge);

            const actions = document.createElement("div");
            actions.className = "video-call-actions";

            const joinButton = createTextElement("button", "", isTeacher && session.status !== "live" ? "Start call" : "Join call");
            joinButton.type = "button";
            joinButton.dataset.videoCallAction = "join";
            joinButton.dataset.roomCode = session.roomCode;
            actions.appendChild(joinButton);

            if (isTeacher) {
                const copyButton = createTextElement("button", "video-call-copy", "Copy room code");
                copyButton.type = "button";
                copyButton.dataset.videoCallAction = "copy";
                copyButton.dataset.roomCode = session.roomCode;
                actions.appendChild(copyButton);

                const endButton = createTextElement("button", "video-call-end", "End class");
                endButton.type = "button";
                endButton.dataset.videoCallAction = "end";
                endButton.dataset.sessionId = session.id;
                actions.appendChild(endButton);
            }

            card.append(details, actions);
            list.appendChild(card);
        });
    }

    list.addEventListener("click", function(event) {
        const button = event.target.closest("button[data-video-call-action]");
        if (!button) {
            return;
        }

        const action = button.dataset.videoCallAction;
        const sessions = readSessions();

        if (action === "join") {
            const session = sessions.find(function(item) {
                return item.roomCode === button.dataset.roomCode;
            });

            if (isTeacher && session && session.status !== "live") {
                session.status = "live";
                session.startedAt = new Date().toISOString();
                if (!saveSessions(sessions)) {
                    return;
                }
                renderSessions();
            }

            openRoom(button.dataset.roomCode);
            return;
        }

        if (action === "end") {
            const session = sessions.find(function(item) {
                return item.id === button.dataset.sessionId && item.teacherUsername === username;
            });
            if (!session) {
                return;
            }

            session.status = "completed";
            session.completedAt = new Date().toISOString();
            if (saveSessions(sessions)) {
                status.textContent = "Video class ended.";
                renderSessions();
            }
            return;
        }

        if (action === "copy") {
            const roomCode = button.dataset.roomCode;
            if (!navigator.clipboard || !navigator.clipboard.writeText) {
                status.textContent = "Clipboard access is unavailable. Share this room code instead: " + roomCode;
                return;
            }

            navigator.clipboard.writeText(roomCode).then(function() {
                status.textContent = "Room code copied. Send it to your students so they can join.";
            }).catch(function() {
                status.textContent = "Could not copy the room code. Share it manually: " + roomCode;
            });
        }
    });

    if (teacherForm) {
        teacherForm.addEventListener("submit", function(event) {
            event.preventDefault();

            const titleInput = document.getElementById("videoCallTitle");
            const timeInput = document.getElementById("videoCallTime");
            const scheduledAt = timeInput.value ? new Date(timeInput.value).toISOString() : "";
            const now = new Date().toISOString();
            const startsLater = scheduledAt && new Date(scheduledAt).getTime() > Date.now();
            const session = {
                id: Date.now() + "-" + Math.random().toString(36).slice(2),
                title: titleInput.value.trim(),
                teacherUsername: username,
                roomCode: makeRoomCode(),
                createdAt: now,
                scheduledAt: scheduledAt,
                status: startsLater ? "scheduled" : "live"
            };

            const sessions = readSessions();
            sessions.push(session);
            if (!saveSessions(sessions)) {
                return;
            }

            teacherForm.reset();
            status.textContent = startsLater
                ? "Video class scheduled. Share the room code with your students."
                : "Video class created. Share the room code with your students.";
            renderSessions();

            if (!startsLater) {
                openRoom(session.roomCode);
            }
        });
    }

    if (studentForm) {
        studentForm.addEventListener("submit", function(event) {
            event.preventDefault();
            const roomCode = document.getElementById("videoCallRoomCode").value.trim();
            if (!roomCode) {
                status.textContent = "Enter the room code your teacher shared.";
                return;
            }

            openRoom(roomCode);
            status.textContent = "Opening your video class in a new tab.";
            studentForm.reset();
        });
    }

    window.addEventListener("storage", function(event) {
        if (event.key === storageKey) {
            renderSessions();
        }
    });

    renderSessions();
})();
