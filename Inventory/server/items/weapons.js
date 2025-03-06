export const WEAPONS = {
    REVOLVER: {
        itemId: 1,
        name: "Revolver",
        type: "weapon",
        weight: 2.5,
        model: "weapon_revolver",
        ammoType: "AMMO_REVOLVER",
        container: "equipment",
        metadata: {
            quality: 100,
            durability: 100,
            isIllegal: true
        },
        // Entferne die Funktionen aus dem Objekt
        damage: 75,
        range: 25,
        reloadTime: 2.5
    }
};