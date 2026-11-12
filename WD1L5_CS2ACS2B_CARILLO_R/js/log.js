// log.js - Login page 

const USERS_KEY = "groceryUsers";           // same key used by reg.js
const SESSION_KEY = "groceryCurrentUser";   // who is logged in (sessionStorage)

// Get the saved users array. Returns [] if nothing is saved yet.
function getUsers() {
    try {
        return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    } catch (error) {
        return [];
    }
}

// Find one user object by username (case-insensitive).
function findUser(username) {
    return getUsers().find(function (user) {
        return user.username.toLowerCase() === username.toLowerCase();
    });
}

// Show a message under the form (type = "error" or "success")
function showMessage(elementId, text, type) {
    const box = document.getElementById(elementId);
    box.textContent = text;
    box.className = "message " + type;
}

document.getElementById("loginForm").addEventListener("submit", loginUser);

// Checkbox that shows or hides the password text
document.getElementById("showPassword").addEventListener("change", function () {
    document.getElementById("login_pword").type = this.checked ? "text" : "password";
});

function loginUser(event) {
    event.preventDefault();

    const username = document.getElementById("login_uname").value.trim();
    const password = document.getElementById("login_pword").value;

    // No accounts saved at all yet
    if (getUsers().length === 0) {
        showMessage("logMessage", "No account found. Please sign up first.", "error");
        return;
    }

    // Look for the user object that matches the username
    const user = findUser(username);

    // The user must exist AND the password must match
    if (user && user.password === password) {
        sessionStorage.setItem(SESSION_KEY, user.username); // remember who is logged in
        window.location.href = "list.html";
    } else {
        showMessage("logMessage", "Wrong username or password.", "error");
    }
}