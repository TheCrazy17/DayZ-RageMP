let debugMode = false;
const debugMarkers = new Map(); // colshape -> marker

mp.keys.bind(0x71, false, () => { // F2 para togglear debug
    debugMode = !debugMode;
    mp.gui.chat.push(`{FFFF00}Debug colshapes: ${debugMode ? "ON" : "OFF"}`);

    if (!debugMode) {
        // Borrar todos los markers si apagás el debug
        debugMarkers.forEach(marker => {
            if (marker && marker.doesExist()) marker.destroy();
        });
        debugMarkers.clear();
    }
});

mp.events.add('render', () => {
    if (!debugMode) return;

    // Revisar todos los colshapes en stream range
    mp.colshapes.forEachInStreamRange((shape) => {
        if (!debugMarkers.has(shape)) {
            // Crear marker en la posición del colshape
            const pos = shape.position || null;
            if (pos) {
                const marker = mp.markers.new(
                    1, // tipo de marker
                    new mp.Vector3(pos.x, pos.y, pos.z - 1.0), // posición
                    1.0, // tamaño
                    {
                        color: [255, 0, 0, 100],
                        visible: true,
                        dimension: mp.players.local.dimension
                    }
                );
                debugMarkers.set(shape, marker);
            }
        }
    });

    // Borrar markers de colshapes que ya no están en rango
    debugMarkers.forEach((marker, shape) => {
        if (!shape.handle || !shape.isInStreamRange) {
            if (marker && marker.doesExist()) marker.destroy();
            debugMarkers.delete(shape);
        }
    });
});
let speedometerWindow = mp.browsers.new("package://LootManager_C/html/inventory.html");
let showing = false;
let currentCol = null;

// Toggle inventario
mp.keys.bind(0x4A, false, () => {
    showing = !showing;

    let loot = [];
    if (currentCol) {
        loot = currentCol.getVariable("Loot") || [];
    }

    speedometerWindow.call("showInventory", showing, loot);
    mp.gui.cursor.show(showing, showing);
});

// Cuando cambia el colshape actual
mp.events.addDataHandler("currentLoot", (entity, value, oldValue) => {
    mp.gui.chat.push(`[CLIENTE] Cambio de currentLoot`);
    currentCol = value;

    // 🔹 Si el inventario está abierto, refrescar con loot actual
    let loot = (currentCol && currentCol.getVariable("Loot")) || [];
    speedometerWindow.call("refreshLootPoint", loot);
});

// Cuando el servidor actualiza la variable "Loot" de cualquier colshape
mp.events.addDataHandler("Loot", (entity, value, oldValue) => {
    // 🔹 Solo refrescar si el colshape afectado es el actual
    if (currentCol && entity && entity.id === currentCol.id) {
        speedometerWindow.call("refreshLootPoint", value || []);
    }
});

// Evento al tomar loot
mp.events.add("onClientTakeLoot", (itemName) => {
    console.log("Tomaste:", itemName);
    mp.game.graphics.notify(`Recogiste: ${itemName}`);
    mp.events.callRemote("takeLootItem", itemName);
});