import * as alt from 'alt-server';

alt.on('playerConnect', (player) => {
    player.inventory = [
        { name: "Starter-Brot", amount: 3 },
        { name: "Wasserflasche", amount: 2 }
    ];
});

alt.onClient("requestInventory", (player) => {
    alt.emitClient(player, "populateInventory", player.inventory);
});

alt.on("chatMessage", (player, message) => {
    if (message.startsWith("/additem")) {
        const args = message.split(" ");
        if (args.length >= 3) {
            const itemName = args[1];
            const amount = parseInt(args[2]);
            
            const existingItem = player.inventory.find(item => item.name === itemName);
            if (existingItem) {
                existingItem.amount += amount;
            } else {
                player.inventory.push({ name: itemName, amount });
            }
            
            alt.emitClient(player, "populateInventory", player.inventory);
            return false;
        }
    }
    return true;
});