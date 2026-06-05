import { world, system } from "@minecraft/server";
const RAD_OBJECTIVE_ID = "rad";
const PROTECTION_OBJECTIVE_ID = "radprotection";
const CLOSED_CORE_ID = "utilitycraft:crown_demon_core_closed";
const OPEN_CORE_ID = "utilitycraft:crown_demon_core_open";
const GEIGER_ID = "utilitycraft:ryno_geiger_counter";
const GEIGER_DURATION_TICKS = 200;
const TIER_TICK_INTERVAL = 20;
const CORE_CLOSE_CHANCE_HELD = 1 / 10000;
const RAD_BLOCK_THRESHOLD = 12;
const RAD_TAG_PREFIX = "radv:";
const GEIGER_TIMER = new Map();
const PLAYER_LAST_RAD = new Map();
const LAST_EXPOSURE_TICK = new Map();
let currentTick = 0;
const UNDEAD_IDS = new Set([
    "minecraft:zombie", "minecraft:zombie_villager", "minecraft:husk", "minecraft:drowned",
    "minecraft:zombified_piglin", "minecraft:skeleton", "minecraft:stray", "minecraft:wither_skeleton",
    "minecraft:wither", "minecraft:skeleton_horse", "minecraft:zombie_horse", "minecraft:bogged"
]);
function getOrCreateObjective(id, displayName) {
    let objective = world.scoreboard.getObjective(id);
    if (!objective) objective = world.scoreboard.addObjective(id, displayName);
    return objective;
}
function getScore(objective, entity) {
    try { return objective.getScore(entity) ?? 0; } catch { return 0; }
}
function setScore(objective, entity, value) {
    try {
        objective.setScore(entity, Math.max(0, Math.floor(value)));
        return true;
    } catch { return false; }
}
function addScore(objective, entity, amount) {
    if (amount > 0) LAST_EXPOSURE_TICK.set(entity.id, currentTick);
    return setScore(objective, entity, getScore(objective, entity) + amount);
}
function getRadMultiplier(protection) {
    if (protection >= RAD_BLOCK_THRESHOLD) return 0;
    return (RAD_BLOCK_THRESHOLD - protection) / RAD_BLOCK_THRESHOLD;
}
function safeIsValid(entity) {
    try { return !!entity?.isValid; } catch { return false; }
}
function isLiving(entity) {
    if (!safeIsValid(entity)) return false;
    try { return !!entity.getComponent("minecraft:health"); } catch { return false; }
}
function isUndead(entity) {
    if (UNDEAD_IDS.has(entity.typeId)) return true;
    try { return !!entity.getComponent("minecraft:type_family")?.hasTypeFamily?.("undead"); } catch { return false; }
}
function* livingEntities() {
    const seen = new Set();
    for (const player of world.getAllPlayers()) {
        seen.add(player.id); yield player;
    }
    for (const dimId of ["overworld", "nether", "the_end"]) {
        for (const entity of world.getDimension(dimId).getEntities()) {
            if (seen.has(entity.id) || entity.typeId === "minecraft:player" || !isLiving(entity)) continue;
            seen.add(entity.id); yield entity;
        }
    }
}
function getMobLastRad(entity) {
    if (!safeIsValid(entity)) return undefined;
    try {
        for (const tag of entity.getTags()) {
            if (tag.startsWith(RAD_TAG_PREFIX)) {
                const val = Number(tag.slice(RAD_TAG_PREFIX.length));
                return Number.isFinite(val) && val >= 0 ? Math.floor(val) : 0;
            }
        }
    } catch {}
    return undefined;
}
function setMobLastRad(entity, value) {
    if (!safeIsValid(entity)) return false;
    try {
        for (const tag of entity.getTags()) if (tag.startsWith(RAD_TAG_PREFIX)) entity.removeTag(tag);
        return entity.addTag(`${RAD_TAG_PREFIX}${Math.max(0, Math.floor(value))}`);
    } catch { return false; }
}
function applyRadiationEffects(entity, rad, protection) {
    if (rad <= 0 || protection >= RAD_BLOCK_THRESHOLD) return;
    try {
        if (isUndead(entity)) {
            const amp = rad > 639 ? 2 : rad > 159 ? 1 : 0;
            entity.addEffect("speed", 60, { amplifier: amp, showParticles: false });
            if (rad > 79) entity.addEffect("strength", 60, { amplifier: rad > 1279 ? 3 : amp, showParticles: false });
            if (rad > 159) entity.addEffect("resistance", 60, { amplifier: amp, showParticles: false });
            if (rad > 319) entity.addEffect("regeneration", 60, { amplifier: amp, showParticles: false });
        } else {
            if (rad <= 24) return;
            const amp = rad > 1279 ? 3 : rad > 639 ? 2 : rad > 319 ? 1 : 0;
            entity.addEffect("nausea", 60, { amplifier: Math.min(2, amp), showParticles: false });
            if (rad > 79) entity.applyDamage(rad > 1279 ? 6 + Math.floor((rad - 1280) / 128) : rad > 639 ? 3 : rad > 319 ? 2 : 1);
            if (rad > 159) entity.addEffect("slowness", 60, { amplifier: amp, showParticles: false });
            if (rad > 319) entity.addEffect("mining_fatigue", 60, { amplifier: amp, showParticles: false });
            if (rad > 639) entity.addEffect("blindness", 40, { amplifier: 0, showParticles: false });
        }
    } catch {}
}
function emitAmbientRadiation(entities, radObjective, protectionObjective) {
    const sources = entities.filter(e => getScore(radObjective, e) > 24);
    for (const source of sources) {
        const sourcePos = source.location;
        const emission = Math.max(1, Math.floor(getScore(radObjective, source) / 40));
        for (const target of entities) {
            if (target.id === source.id) continue;
            const dx = target.location.x - sourcePos.x;
            const dy = (target.location.y + 1) - (sourcePos.y + 1);
            const dz = target.location.z - sourcePos.z;
            const distSq = dx * dx + dy * dy + dz * dz;
            if (distSq > 100) continue;
            let baseExposure = emission / Math.max(1, distSq / 4); 
            if (baseExposure < 1) continue;
            const dist = Math.sqrt(distSq);
            const dir = { x: dx/dist, y: dy/dist, z: dz/dist };
            const rayStart = { x: sourcePos.x, y: sourcePos.y + 1, z: sourcePos.z };
            try {
                const blockHit = source.dimension.getBlockFromRay(rayStart, dir, { maxDistance: dist });
                if (blockHit && blockHit.block) {
                    baseExposure *= 0.15; 
                }
            } catch {}
            const protection = getScore(protectionObjective, target);
            const gain = Math.floor(baseExposure * getRadMultiplier(protection));
            if (gain > 0) addScore(radObjective, target, gain);
        }
    }
}
system.run(() => {
    getOrCreateObjective(RAD_OBJECTIVE_ID, "Radiation");
    getOrCreateObjective(PROTECTION_OBJECTIVE_ID, "Radiation Protection");
});
world.afterEvents.itemUse.subscribe((event) => {
    if (event.itemStack?.typeId === GEIGER_ID) {
        GEIGER_TIMER.set(event.source.id, currentTick + GEIGER_DURATION_TICKS);
    }
});
world.afterEvents.entityDie.subscribe((event) => {
    if (!event.deadEntity) return;
    GEIGER_TIMER.delete(event.deadEntity.id);
    LAST_EXPOSURE_TICK.delete(event.deadEntity.id);
    if (event.deadEntity.typeId === "minecraft:player") {
        PLAYER_LAST_RAD.delete(event.deadEntity.id);
        setScore(getOrCreateObjective(RAD_OBJECTIVE_ID, "Radiation"), event.deadEntity, 0);
    }
});
system.runInterval(() => {
    currentTick++;
    const radObjective = getOrCreateObjective(RAD_OBJECTIVE_ID, "Radiation");
    const protectionObjective = getOrCreateObjective(PROTECTION_OBJECTIVE_ID, "Radiation Protection");
    const entities = Array.from(livingEntities());
    emitAmbientRadiation(entities, radObjective, protectionObjective);
    for (const entity of entities) {
        let currentRad = getScore(radObjective, entity);
        const protection = getScore(protectionObjective, entity);
        const lastExp = LAST_EXPOSURE_TICK.get(entity.id) || 0;
        if (currentRad > 0 && (currentTick - lastExp) > 600) {
            if (currentTick % 2 === 0) {
                currentRad -= 1;
                setScore(radObjective, entity, currentRad);
                if (entity.typeId !== "minecraft:player") setMobLastRad(entity, currentRad);
            }
        }
        applyRadiationEffects(entity, currentRad, protection);
        if (entity.typeId === "minecraft:player") {
            PLAYER_LAST_RAD.set(entity.id, currentRad);
            const until = GEIGER_TIMER.get(entity.id) ?? 0;
            if (until > currentTick) {
                const remaining = Math.ceil((until - currentTick) / 20);
                let color = "§a", name = "Clean";
                if (currentRad > 1279) { color = "§4"; name = "Fatal"; }
                else if (currentRad > 639) { color = "§c"; name = "Critical"; }
                else if (currentRad > 319) { color = "§6"; name = "High"; }
                else if (currentRad > 159) { color = "§e"; name = "Elevated"; }
                else if (currentRad > 24) { color = "§2"; name = "Trace"; }
                entity.onScreenDisplay.setActionBar(`§cRad: §f${currentRad} §7| §bProt: §f${protection} §7| ${color}${name} §7| §f${remaining}s`);
            } else {
                GEIGER_TIMER.delete(entity.id);
            }
        }
    }
}, TIER_TICK_INTERVAL);
