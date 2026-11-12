// reg.js - Registration page

// Storage key for the users array (kept in one place)
const USERS_KEY = "groceryUsers";

// Get the saved users array. Returns [] if nothing is saved yet.
function getUsers() {
    try {
        return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    } catch (error) {
        return []; // saved data was corrupted, start fresh
    }
}

// Save the whole users array back to localStorage as a JSON string.
function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
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

// Listen for the form's submit event
document.getElementById("regForm").addEventListener("submit", saveUserRecord);

function saveUserRecord(event) {
    event.preventDefault(); // stop the page from reloading

    // STEP 1: collect the inputs into ONE object
    const newUser = {
        fullName: document.getElementById("full_name").value.trim(),
        address:  document.getElementById("address").value.trim(),
        username: document.getElementById("user_name").value.trim(),
        email:    document.getElementById("email").value.trim(),
        password: document.getElementById("pword").value
    };

    // STEP 2: validate. Object.values() gives an array of the fields.
    if (Object.values(newUser).some(function (value) { return value === ""; })) {
        showMessage("regMessage", "Please complete all required details.", "error");
        return;
    }

    if (!/^\S+@\S+\.\S+$/.test(newUser.email)) {
        showMessage("regMessage", "Please enter a valid email address.", "error");
        return;
    }

    if (newUser.password.length < 6) {
        showMessage("regMessage", "Password must be at least 6 characters.", "error");
        return;
    }

    // STEP 3: no two users may share a username
    if (findUser(newUser.username)) {
        showMessage("regMessage", "That username is taken. Try another one.", "error");
        return;
    }

    // STEP 4: add the new user to the array, then save the array
    const users = getUsers();
    users.push(newUser);
    saveUsers(users);

    showMessage("regMessage", "Account created! Taking you to log in...", "success");

    // STEP 5: go to the login page after a short pause
    setTimeout(function () {
        window.location.href = "login.html";
    }, 1200);
}