// list.js  -  Grocery list page 

// Storage keys (same names used by reg.js and log.js)
const USERS_KEY = "groceryUsers";
const SESSION_KEY = "groceryCurrentUser";
const LIST_KEY = "groceryList_";    // + username -> that user's items

// Gets the saved users array. Returns [] if nothing is saved yet.
function getUsers() {
    try {
        return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    } catch (error) {
        return [];
    }
}

// Gets the logged-in user object, or null if nobody is logged in
function getCurrentUser() {
    const username = sessionStorage.getItem(SESSION_KEY);
    if (!username) return null;
    return getUsers().find(function (user) {
        return user.username === username;
    }) || null;
}

// Log out: forget the session and go back to the login page
function logoutUser() {
    sessionStorage.removeItem(SESSION_KEY);
    window.location.href = "login.html";
}

// Load / save one user's grocery items (an array of objects)
function getItems(username) {
    try {
        return JSON.parse(localStorage.getItem(LIST_KEY + username)) || [];
    } catch (error) {
        return [];
    }
}

function saveItems(username, items) {
    localStorage.setItem(LIST_KEY + username, JSON.stringify(items));
}

// ----- Page guard: only logged-in users may see this page -----
const currentUser = getCurrentUser();
if (currentUser === null) {
    window.location.href = "login.html";
}

// The list lives in an ARRAY of OBJECTS, e.g.
// [ { id: 1699999999, name: "Rice", qty: 2, category: "Pantry", bought: false } ]
let items = getItems(currentUser.username);

// Which tab is selected: "all", "todo" or "bought"
let currentFilter = "all";

// Grab the elements we use often, once
const listEl = document.getElementById("groceryList");
const emptyEl = document.getElementById("emptyNote");
const summaryEl = document.getElementById("summary");
const countEl = document.getElementById("countLabel");
const barEl = document.getElementById("progressBar");

// Fill in the user's name
document.getElementById("welcomeName").textContent = currentUser.fullName.split(" ")[0];
document.getElementById("userTag").textContent = currentUser.username;

// ----- Event listeners (no inline onclick in the HTML) -----
document.getElementById("itemForm").addEventListener("submit", addItem);
document.getElementById("clearBtn").addEventListener("click", clearList);
document.getElementById("logoutBtn").addEventListener("click", logoutUser);

// Filter tabs: one listener for all three buttons (event delegation)
document.getElementById("filterTabs").addEventListener("click", function (event) {
    if (!event.target.matches(".tab")) return;
    currentFilter = event.target.dataset.filter;

    // move the "active" look to the clicked tab
    document.querySelectorAll(".tab").forEach(function (tab) {
        tab.classList.toggle("active", tab === event.target);
    });
    renderList();
});

// One listener on the <ul> handles every checkbox and delete button
listEl.addEventListener("click", function (event) {
    const row = event.target.closest("li");
    if (!row) return;
    const id = Number(row.dataset.id);

    if (event.target.matches(".toggle")) toggleBought(id);
    if (event.target.matches(".remove")) removeItem(id);
});

// ----- Functions -----

// Add a new item object to the array
function addItem(event) {
    event.preventDefault();

    const name = document.getElementById("item_name").value.trim();
    const qty = Number(document.getElementById("item_qty").value);
    const category = document.getElementById("item_cat").value;

    if (name === "" || qty < 1) {
        alert("Please enter an item name and a quantity of at least 1.");
        return;
    }

    items.push({ id: Date.now(), name: name, qty: qty, category: category, bought: false });
    saveAndRender();

    // Reset the form and put the cursor back for the next item
    event.target.reset();
    document.getElementById("item_name").focus();
}

// Flip the "bought" value (true <-> false) of one item
function toggleBought(id) {
    const item = items.find(function (entry) { return entry.id === id; });
    item.bought = !item.bought;
    saveAndRender();
}

// Keep every item except the one with this id
function removeItem(id) {
    items = items.filter(function (entry) { return entry.id !== id; });
    saveAndRender();
}

// Empty the whole array (after asking first)
function clearList() {
    if (items.length === 0) return;
    if (confirm("Remove all items from your list?")) {
        items = [];
        saveAndRender();
    }
}

// Save the array to localStorage, then redraw the screen
function saveAndRender() {
    saveItems(currentUser.username, items);
    renderList();
}

// Return only the items that match the selected tab
function getVisibleItems() {
    return items.filter(function (entry) {
        if (currentFilter === "todo") return !entry.bought;
        if (currentFilter === "bought") return entry.bought;
        return true; // "all"
    });
}

// Rebuild the <ul> from the array. The array is the single source of truth.
function renderList() {
    listEl.innerHTML = "";
    const visible = getVisibleItems();

    visible.forEach(function (item) {
        const row = document.createElement("li");
        row.dataset.id = item.id;
        row.dataset.cat = item.category || "Other"; // older saved items have no category
        if (item.bought) row.classList.add("done");

        row.innerHTML =
            '<input type="checkbox" class="toggle" aria-label="Mark as bought">' +
            '<span class="item-name"></span>' +
            '<span class="item-tag"></span>' +
            '<span class="item-qty"></span>' +
            '<button type="button" class="remove" aria-label="Delete item">Delete</button>';

        // textContent (not innerHTML) so typed text can never inject HTML
        row.querySelector(".toggle").checked = item.bought;
        row.querySelector(".item-name").textContent = item.name;
        row.querySelector(".item-tag").textContent = row.dataset.cat;
        row.querySelector(".item-qty").textContent = "x" + item.qty;

        listEl.appendChild(row);
    });

    // Empty message depends on why the list is empty
    emptyEl.hidden = visible.length > 0;
    emptyEl.textContent = items.length === 0
        ? "Nothing here yet. Add your first item above."
        : "No items in this tab.";

    updateProgress();
}

// Update the hero text and the progress bar
function updateProgress() {
    const total = items.length;
    const boughtCount = items.filter(function (entry) { return entry.bought; }).length;
    const percent = total === 0 ? 0 : Math.round((boughtCount / total) * 100);

    barEl.style.width = percent + "%";
    countEl.textContent = total + (total === 1 ? " item" : " items");

    if (total === 0) {
        summaryEl.textContent = "Your list is empty. Start adding items.";
    } else if (boughtCount === total) {
        summaryEl.textContent = "All done! Everything is in the basket.";
    } else {
        summaryEl.textContent = boughtCount + " of " + total + " bought (" + percent + "%)";
    }
}

// First draw when the page opens
renderList();