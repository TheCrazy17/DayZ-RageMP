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
        blip,
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
    shape.setVariable("Loot", { loot: lootData.loot, coords: lootData.coords });

    const spawnedObjects = [];

    lootItems.forEach(item => {
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
});

mp.events.add("playerExitColshape", (player, shape) => {
    const lootData = ActiveLootPoints.get(shape);
    if (!lootData) return;
    player.outputChatBox(`{FF0000}Has salido de un punto de loot.`);
});

mp.events.addCommand("refreshLoot", (player, _, arg) => {
    const force = arg && arg.toLowerCase() === "force";
    refreshAllLootPoints(force);
    player.outputChatBox(`{00FF00}🟢 Loot refrescado. Modo forzado: ${force}`);
});

// Crear loot militar desde config
LootConfig.LootPoints.Militar.forEach(([x, y, z]) => {
    createLootPoint("Militar", x, y, z);
});
