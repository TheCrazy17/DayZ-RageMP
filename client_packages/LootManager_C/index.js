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

speedometerWindow = mp.browsers.new("package://LootManager_C/inventory.html");
showing = false

mp.keys.bind(0x4A, false, () => { // F2 para togglear debug
    showing = !showing;

    speedometerWindow.call("showInventory", showing);
    mp.gui.cursor.show(showing, showing); //Disables the players controls and shows the cursor
});