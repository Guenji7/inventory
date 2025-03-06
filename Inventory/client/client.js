import * as alt from 'alt-client';

let webView = null;
let inventoryVisible = false;
let currentInventory = null;

// Keybinds
const KEYBINDS = {
    INVENTORY: 73, // I
    TEST_REVOLVER: 79, // O
    QUICKSLOT_1: 49, // 1
    QUICKSLOT_2: 50, // 2
    QUICKSLOT_3: 51, // 3
    QUICKSLOT_4: 52, // 4
    QUICKSLOT_5: 53, // 5
};

// Inventar erstellen/öffnen
function createView() {
    if (!webView) {
        webView = new alt.WebView("http://resource/client/html/inventory.html");
        
        // Event Handler registrieren
        webView.on('moveItem', handleItemMove);
        webView.on('useItem', handleItemUse);
        webView.on('dropItem', handleItemDrop);
        
        webView.on('load', () => {
            alt.emitServer("requestInventory");
            webView.focus();
            alt.showCursor(true);
            alt.toggleGameControls(false);
        });
    }
}

// Server Events
alt.onServer('populateInventory', (inventoryData) => {
    currentInventory = inventoryData;
    if (webView) {
        webView.emit('updateInventory', inventoryData);
    }
});

alt.onServer('updateInventory', (inventoryData) => {
    currentInventory = inventoryData;
    if (webView) {
        webView.emit('updateInventory', inventoryData);
    }
});

alt.onServer('inventoryError', (message) => {
    if (webView) {
        webView.emit('showError', message);
    }
});

alt.onServer('showNotification', (message) => {
    if (webView) {
        webView.emit('showNotification', message);
    } else {
        console.log(message); // Fallback wenn WebView nicht aktiv
    }
});

// Key Events
alt.on("keyup", (key) => {
    switch(key) {
        case KEYBINDS.INVENTORY:
            toggleInventory();
            break;
        case KEYBINDS.TEST_REVOLVER:
            alt.emitServer('addTestRevolver');
            break;
        default:
            if (!inventoryVisible && key >= KEYBINDS.QUICKSLOT_1 && key <= KEYBINDS.QUICKSLOT_5) {
                const slotIndex = key - KEYBINDS.QUICKSLOT_1;
                alt.emitServer("useQuickSlot", slotIndex);
            }
            break;
    }
});

// Item Handling
function handleItemMove(data) {
    alt.emitServer("moveItem", data);
}

function handleItemUse(itemId) {
    alt.emitServer("useItem", itemId);
}

function handleItemDrop(data) {
    alt.emitServer("dropItem", data);
}

// Toggle Inventar
function toggleInventory() {
    if (!inventoryVisible) {
        createView();
    } else {
        if (webView) {
            webView.destroy();
            webView = null;
        }
        alt.showCursor(false);
        alt.toggleGameControls(true);
    }
    inventoryVisible = !inventoryVisible;
}

// Weapon Events
alt.onServer('equipWeapon', (weaponHash, ammo) => {
    const localPlayer = alt.Player.local;
    if (localPlayer && weaponHash) {
        localPlayer.giveWeapon(weaponHash, ammo, true);
    }
});

alt.onServer('removeWeapon', (weaponHash) => {
    const localPlayer = alt.Player.local;
    if (localPlayer && weaponHash) {
        localPlayer.removeWeapon(weaponHash);
    }
});