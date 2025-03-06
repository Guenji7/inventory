import * as alt from 'alt-server';
import Database from './database.js';
import Player from '../../roleplay/server/models/Player.js';
import { WEAPONS } from './items/weapons.js';

let isDatabaseConnected = false;

// Initialisiere Datenbankverbindung
(async () => {
    isDatabaseConnected = await Database.connect();
    if (isDatabaseConnected) {
        alt.log('[Inventory] Datenbankverbindung hergestellt');
        initializeCommands();
    }
})();

function initializeCommands() {
    alt.on('playerCommand', async (player, command) => {
        const args = command.split(' ');
        const cmd = args[0].toLowerCase();

        if (cmd === 'giveweapon') {
            if (args.length < 2) {
                alt.emitClient(player, "showNotification", "Verwendung: /giveweapon [weapon_name]");
                return;
            }

            const weaponName = args[1].toLowerCase();
            await handleGiveWeapon(player, weaponName);
        }
    });
}

async function handleGiveWeapon(player, weaponName) {
    if (!isDatabaseConnected) {
        alt.emitClient(player, "showNotification", "Datenbank nicht verfügbar");
        return;
    }

    try {
        // Hole Spieler aus der Datenbank
        let playerData = await Player.findOne({ discordID: player.discordID });
        if (!playerData) {
            alt.emitClient(player, "showNotification", "Spielerdaten nicht gefunden");
            return;
        }

        if (weaponName === 'weapon_revolver') {
            // Erstelle Waffen-Item
            const weaponItem = {
                itemId: WEAPONS.REVOLVER.itemId,
                name: WEAPONS.REVOLVER.name,
                type: 'weapon',
                weight: WEAPONS.REVOLVER.weight,
                model: weaponName,
                ammoType: WEAPONS.REVOLVER.ammoType,
                amount: 1,
                slot: findEmptyMainSlot(playerData.inventory),
                container: 'main',
                metadata: {
                    quality: 100,
                    durability: 100,
                    isIllegal: true
                }
            };

            // Füge Waffe zum Inventar hinzu
            playerData.inventory.push(weaponItem);
            
            // Aktualisiere Gewicht
            playerData.inventoryWeight = calculateInventoryWeight(playerData.inventory);

            // Speichere in Datenbank
            await playerData.save();

            // Aktualisiere Spieler-Inventar UI
            updatePlayerInventory(player, playerData);

            // Gib Waffe im Spiel
            const weaponHash = alt.hash(weaponName);
            player.giveWeapon(weaponHash, 100, true);

            alt.emitClient(player, "showNotification", "Revolver wurde deinem Inventar hinzugefügt!");
        }
    } catch (error) {
        console.error('Fehler beim Geben der Waffe:', error);
        alt.emitClient(player, "showNotification", "Datenbankfehler beim Geben der Waffe");
    }
}

function updatePlayerInventory(player, playerData) {
    const inventoryData = {
        mainSlots: playerData.inventory.filter(item => item.container === 'main'),
        equipment: playerData.inventory.filter(item => item.container === 'equipment'),
        quickSlots: playerData.inventory.filter(item => item.container === 'quickslot'),
        currentWeight: playerData.inventoryWeight,
        maxWeight: playerData.maxInventoryWeight
    };

    alt.emitClient(player, "updateInventory", inventoryData);
}

function findEmptyMainSlot(inventory) {
    const usedSlots = inventory
        .filter(item => item.container === 'main')
        .map(item => item.slot);
    
    for (let i = 0; i < 21; i++) {
        if (!usedSlots.includes(i)) return i;
    }
    return -1;
}

function calculateInventoryWeight(inventory) {
    return inventory.reduce((total, item) => {
        return total + (item.weight * (item.amount || 1));
    }, 0);
}

// Event Handler für Inventaranfragen
alt.onClient("requestInventory", async (player) => {
    if (!isDatabaseConnected) {
        alt.emitClient(player, "showNotification", "Datenbank nicht verfügbar");
        return;
    }

    try {
        const playerData = await Player.findOne({ discordID: player.discordID });
        if (playerData) {
            updatePlayerInventory(player, playerData);
        }
    } catch (error) {
        console.error('Fehler beim Laden des Inventars:', error);
    }
});