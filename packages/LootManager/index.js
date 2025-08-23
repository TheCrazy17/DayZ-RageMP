const LootConfig = require("./LootPoints.js");
const ItemDefinitions = require("./ItemDefinitions.js");

const ActiveLootPoints = new Map();

function getItemHashByName(name) {
    const def = ItemDefinitions[name];
    if (!def) {
        console.log(`[❌] No se encontró definición para el ítem: "${name}"`);
        return mp.joaat("prop_cs_box_clothes");
    }
    return def.model;
}

function getLootFromZone(zoneType, maxItems = 3) {
    const chances = LootConfig.LootPercentChance[zoneType] 
        || LootConfig.LootPercentChance[zoneType.toLowerCase()] 
        || LootConfig.LootPercentChance[zoneType.charAt(0).toUpperCase() + zoneType.slice(1).toLowerCase()];
    
    if (!chances) {
        console.log(`[❌] No se encontró LootPercentChance para la zona: "${zoneType}"`);
        return [];
    }

    const shuffled = shuffleArray(Object.entries(chances));
    const result = [];
    for (const [item, chance] of shuffled) {
        if (Math.random() * 100 <= chance) {
            result.push(item);
            if (result.length >= maxItems) break;
        }
    }
    return result;
}

function shuffleArray(array) {
    const copy = array.slice();
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

function randomOffset(base, range = 2) {
    return base + (Math.random() * (range * 2) - range);
}

function randomRotationZ() {
    return Math.random() * 360;
}

// Crear loot point
function createLootPoint(type, x, y, z) {
    const colshape = mp.colshapes.newSphere(x, y, z, 1.5);

    ActiveLootPoints.set(colshape, {
        type,
        loot: [],
        coords: { x, y, z }
    });

    console.log(`🟡 Loot "${type}" creado.`);
    refreshLootPoint(colshape, true);
}

function refreshLootPoint(shape, fullReset = false) {
    // Si no es un punto de loot, se cancela
    if (!ActiveLootPoints.has(shape)) return;

    const lootData = ActiveLootPoints.get(shape);

    if (fullReset) {
        const lootItems = getLootFromZone(lootData.type, 3); // Obtiene nuevos items según el tipo de loot
        lootData.loot = lootItems; // Actualiza los items
        console.log(`🟡 Loot refrescado: ${lootItems}`);
    }

    // Guardamos los datos sincronizados
    shape.setVariable("Loot", lootData.loot);

    const spawnedObjects = [];

    lootData.loot.forEach(item => {
        const model = getItemHashByName(item);
            const obj = mp.objects.new(
                model,
                new mp.Vector3(
                    randomOffset(lootData.coords.x, 1),
                    randomOffset(lootData.coords.y, 1),
                    lootData.coords.z - 0.9
                ),
                {
                    rotation: new mp.Vector3(0, 0, randomRotationZ()),
                    alpha: 255,
                    dimension: 0
                }
            );
            spawnedObjects.push(obj);

        lootData.objects = spawnedObjects;
    });

    ActiveLootPoints.set(shape, lootData);
}

function refreshAllLootPoints(fullReset = false) {
    for (const shape of ActiveLootPoints.keys()) {
        refreshLootPoint(shape, fullReset);
    }
    console.log(`[🔁] Todos los loot points refrescados. FullReset = ${fullReset}`);
}

// Eventos de RageMP
mp.events.add("playerEnterColshape", (player, shape) => {
    const lootData = ActiveLootPoints.get(shape);
    if (!lootData) return;

    player.outputChatBox(`{00FF00}Has entrado a un punto de loot: ${lootData.loot}`);
    player.setVariable('currentLoot', shape);
});

mp.events.add("playerExitColshape", (player, shape) => {
    const lootData = ActiveLootPoints.get(shape);
    if (!lootData) return;

    player.outputChatBox(`{FF0000}Has salido de un punto de loot.`);
    player.setVariable('currentLoot', null);
});

// Comando para refrescar los puntos de loot
// NOTA: Se debe restringir a los administradores
mp.events.addCommand("refreshLoot", (player, _, arg) => {
    const force = arg && arg.toLowerCase() === "force";
    refreshAllLootPoints(force);
    player.outputChatBox(`{00FF00}🟢 Loot refrescado. Modo forzado: ${force}`);
});

// Escuchar el evento que viene desde cualquier cliente
mp.events.add("takeLootItem", (player, itemName) => {
    const shape = player.getVariable('currentLoot');
    if (!shape || !ActiveLootPoints.has(shape)) {
        //player.call("lootResponse", [false, "No estás en un punto de loot válido"]);
        return;
    }

    const lootData = ActiveLootPoints.get(shape);

    // Verificar que el ítem existe en este punto
    const index = lootData.loot.indexOf(itemName);
    if (index === -1) {
        //player.call("lootResponse", [false, "Ese ítem ya fue tomado"]);
        console.log(player.name + " intentó tomar un item inválido!");
        return;
    }

    // Remover el ítem de la lista
    lootData.loot.splice(index, 1);

    // Destruir objeto visual
    if (lootData.objects && lootData.objects[index]) {
        lootData.objects[index].destroy();
        lootData.objects.splice(index, 1);
    }

    // Guardar inventario del jugador (simple ejemplo)
    if (!player.inventory) player.inventory = [];
    player.inventory.push(itemName);

    // Actualizar variables sincronizadas
    shape.setVariable("Loot", lootData.loot);

    ActiveLootPoints.set(shape, lootData);

    // Confirmación al cliente
    player.outputChatBox(`Has recogido: ${itemName}`);
});

// Crear loot militar desde config
LootConfig.LootPoints.Militar.forEach(([x, y, z]) => {
    createLootPoint("Militar", x, y, z);
});

mp.events.addCommand("pos", (player) => {
    const pos = player.position;
    const rot = player.heading; // dirección de la cámara/personaje

    player.outputChatBox(`{00FF00}Tu posición: X: ${pos.x.toFixed(2)} Y: ${pos.y.toFixed(2)} Z: ${pos.z.toFixed(2)} | Rot: ${rot.toFixed(2)}`);
    console.log(`[Coords] ${player.name}: X:${pos.x}, Y:${pos.y}, Z:${pos.z}, Rot:${rot}`);
});