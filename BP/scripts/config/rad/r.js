import { world, system, ItemStack } from "@minecraft/server";
const RAD_OBJECTIVE_ID = "rad";
const PROTECTION_OBJECTIVE_ID = "radprotection";
const CLOSED_CORE_ID = "utilitycraft:crown_demon_core_closed";
const OPEN_CORE_ID = "utilitycraft:crown_demon_core_open";
const GEIGER_ID = "utilitycraft:ryno_geiger_counter";
const RAD_FROM_CLOSED_CORE_PER_SECOND = 20;
const GEIGER_DURATION_TICKS = 200;
const TIER_TICK_INTERVAL = 20;
const CORE_CLOSE_CHANCE_HELD = 1 / 10000;
const GEIGER_TIMER = new Map();
let currentTick = 0;
function getOrCreateObjective(id, displayName) {
    let objective = world.scoreboard.getObjective(id);
    if (!objective) objective = world.scoreboard.addObjective(id, displayName);
    return objective;
}
function getScore(objective, player) {
    try {
        return objective.getScore(player) ?? 0;
    } catch {
        return 0;
    }
}
function setScore(objective, player, value) {
    try {
        objective.setScore(player, Math.max(0, Math.floor(value)));
        return true;
    } catch {
        return false;
    }
}
function addScore(objective, player, amount) {
    const current = getScore(objective, player);
    return setScore(objective, player, current + amount);
}
function setHeldItem(player, typeId, amount = 1) {
    const inventory = player.getComponent("minecraft:inventory")?.container;
    if (!inventory) return false;
    const slot = player.selectedSlotIndex;
    const item = new ItemStack(typeId, amount);
    try {
        inventory.setItem(slot, item);
        return true;
    } catch {
        return false;
    }
}
function maybeCloseHeldCore(player, chance) {
    const inventory = player.getComponent("minecraft:inventory")?.container;
    if (!inventory) return false;
    const held = inventory.getItem(player.selectedSlotIndex);
    if (!held || held.typeId !== OPEN_CORE_ID) return false;
    if (Math.random() >= chance) return false;
    return setHeldItem(player, CLOSED_CORE_ID, held.amount);
}
function tierFromRad(rad) {
    if (rad <= 0) return { name: "Clean", color: "§a" };
    if (rad <= 24) return { name: "Trace", color: "§2" };
    if (rad <= 79) return { name: "Low", color: "§a" };
    if (rad <= 159) return { name: "Elevated", color: "§e" };
    if (rad <= 319) return { name: "High", color: "§6" };
    if (rad <= 639) return { name: "Critical", color: "§c" };
    if (rad <= 1279) return { name: "Severe", color: "§4" };
    return { name: "Fatal", color: "§4" };
}
function applyTierEffects(player, rad, protection) {
    if (rad <= 0 || protection >= 12) return;
    if (rad <= 24) return;
    if (rad <= 79) {
        player.addEffect("nausea", 40, { amplifier: 0, showParticles: false });
        return;
    }
    if (rad <= 159) {
        player.addEffect("nausea", 60, { amplifier: 0, showParticles: false });
        player.addEffect("slowness", 40, { amplifier: 0, showParticles: false });
        return;
    }
    if (rad <= 319) {
        player.addEffect("nausea", 60, { amplifier: 1, showParticles: false });
        player.addEffect("slowness", 60, { amplifier: 1, showParticles: false });
        player.addEffect("mining_fatigue", 60, { amplifier: 0, showParticles: false });
        return;
    }
    if (rad <= 639) {
        player.addEffect("nausea", 60, { amplifier: 1, showParticles: false });
        player.addEffect("slowness", 60, { amplifier: 2, showParticles: false });
        player.addEffect("blindness", 40, { amplifier: 0, showParticles: false });
        player.addEffect("mining_fatigue", 60, { amplifier: 1, showParticles: false });
        player.applyDamage(1);
        return;
    }
    if (rad <= 1279) {
        player.addEffect("nausea", 60, { amplifier: 2, showParticles: false });
        player.addEffect("slowness", 60, { amplifier: 2, showParticles: false });
        player.addEffect("blindness", 40, { amplifier: 0, showParticles: false });
        player.addEffect("mining_fatigue", 60, { amplifier: 2, showParticles: false });
        player.addEffect("weakness", 60, { amplifier: 0, showParticles: false });
        player.applyDamage(2);
        return;
    }
    player.addEffect("nausea", 60, { amplifier: 2, showParticles: false });
    player.addEffect("slowness", 60, { amplifier: 3, showParticles: false });
    player.addEffect("blindness", 40, { amplifier: 0, showParticles: false });
    player.addEffect("mining_fatigue", 60, { amplifier: 3, showParticles: false });
    player.addEffect("weakness", 60, { amplifier: 1, showParticles: false });
    player.applyDamage(4 + Math.floor((rad - 1280) / 128));
}
system.run(() => {
    getOrCreateObjective(RAD_OBJECTIVE_ID, "Radiation");
    getOrCreateObjective(PROTECTION_OBJECTIVE_ID, "Radiation Protection");
});
world.afterEvents.itemUse.subscribe((event) => {
    const player = event.source;
    const item = event.itemStack;
    if (!player || !item) return;
    if (item.typeId === GEIGER_ID) {
        GEIGER_TIMER.set(player.id, currentTick + GEIGER_DURATION_TICKS);
        return;
    }
});
world.afterEvents.entityDie.subscribe((event) => {
    const dead = event.deadEntity;
    if (!dead || dead.typeId !== "minecraft:player") return;
    const objective = getOrCreateObjective(RAD_OBJECTIVE_ID, "Radiation");
    setScore(objective, dead, 0);
    GEIGER_TIMER.delete(dead.id);
});
system.runInterval(() => {
    currentTick++;
    const radObjective = getOrCreateObjective(RAD_OBJECTIVE_ID, "Radiation");
    const protectionObjective = getOrCreateObjective(PROTECTION_OBJECTIVE_ID, "Radiation Protection");
    for (const player of world.getAllPlayers()) {
        const until = GEIGER_TIMER.get(player.id) ?? 0;
        if (until <= currentTick) {
            GEIGER_TIMER.delete(player.id);
        } else {
            const rad = getScore(radObjective, player);
            const protection = getScore(protectionObjective, player);
            const tier = tierFromRad(rad);
            const remaining = Math.ceil((until - currentTick) / 20);
            player.onScreenDisplay.setActionBar(`§cRad: §f${rad} §7| §bProt: §f${protection} §7| ${tier.color}${tier.name} §7| §f${remaining}s`);
        }
    }
}, 1);
system.runInterval(() => {
    const radObjective = getOrCreateObjective(RAD_OBJECTIVE_ID, "Radiation");
    const protectionObjective = getOrCreateObjective(PROTECTION_OBJECTIVE_ID, "Radiation Protection");
    for (const player of world.getAllPlayers()) {
        const rad = getScore(radObjective, player);
        const protection = getScore(protectionObjective, player);
        applyTierEffects(player, rad, protection);
        if (player.hasTag("rad_core_pending")) {
            player.removeTag("rad_core_pending");
            addScore(radObjective, player, RAD_FROM_CLOSED_CORE_PER_SECOND);
        }
        const inventory = player.getComponent("minecraft:inventory")?.container;
        if (!inventory) continue;
        const held = inventory.getItem(player.selectedSlotIndex);
        if (held?.typeId === CLOSED_CORE_ID) {
            addScore(radObjective, player, RAD_FROM_CLOSED_CORE_PER_SECOND);
            maybeCloseHeldCore(player, CORE_CLOSE_CHANCE_HELD);
        } else if (held?.typeId === OPEN_CORE_ID) {
            maybeCloseHeldCore(player, CORE_CLOSE_CHANCE_HELD);
        }
    }
}, TIER_TICK_INTERVAL);
