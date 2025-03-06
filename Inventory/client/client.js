import * as alt from 'alt-client';

let webView = null;
let inventoryVisible = false;

function createView() {
    if (!webView) {
        webView = new alt.WebView("http://resource/client/html/inventory.html");
        webView.on('load', () => {
            alt.emitServer("requestInventory"); // Daten erst NACH Laden anfordern
            webView.focus();
            alt.showCursor(true);
            alt.toggleGameControls(false);
        });
    }
}

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

alt.on("keyup", (key) => {
    if (key === 73) { // 73 = I
        toggleInventory();
    }
});