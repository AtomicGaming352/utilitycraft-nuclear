import { world, system, ItemStack } from "@minecraft/server";
const RAD_SCOREBOARD = "rad";
const CLOSED_CORE_PROJECTILE = "crownbossyt:demon_core_closed_projectile";
const OPEN_CORE_ID = "crownbossyt:demon_core_open";
const CLOSED_CORE_ID = "crownbossyt:demon_core_closed";
const FLASK_RAD_REDUCTION = {
    "crownbossyt:lesser_purifying_flask": 50,
    "crownbossyt:purifying_flask": 100,
    "crownbossyt:greater_purifying_flask": 200
};
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
function addRad(target, amount) {
    const objective = getOrCreateObjective(RAD_SCOREBOARD, "rad");
    const current = getScore(objective, target);
    setScore(objective, target, current + amount);
}
function removeRad(target, amount) {
    const objective = getOrCreateObjective(RAD_SCOREBOARD, "rad");
    const current = getScore(objective, target);
    setScore(objective, target, current - amount);
}
function replaceHeldItem(player, typeId) {
    const inventory = player.getComponent("minecraft:inventory")?.container;
    if (!inventory) return false;
    const held = inventory.getItem(player.selectedSlotIndex);
    if (!held) return false;
    try {
        inventory.setItem(player.selectedSlotIndex, new ItemStack(typeId, held.amount));
        return true;
    } catch {
        return false;
    }
}
function maybeCloseHeldOpenCore(player, chanceDenominator) {
    const inventory = player.getComponent("minecraft:inventory")?.container;
    if (!inventory) return false;
    const held = inventory.getItem(player.selectedSlotIndex);
    if (!held || held.typeId !== OPEN_CORE_ID) return false;
    if (Math.floor(Math.random() * chanceDenominator) !== 0) return false;
    return replaceHeldItem(player, CLOSED_CORE_ID);
}
function cleanupProjectile(projectile) {
    system.run(() => {
        try {
            projectile.remove();
        } catch {
            try {
                projectile.kill();
            } catch {}
        }
    });
}
world.afterEvents.projectileHitEntity.subscribe((event) => {
    const projectile = event.projectile;
    if (projectile?.typeId !== CLOSED_CORE_PROJECTILE) return;
    const hitEntity = event.getEntityHit()?.entity;
    if (hitEntity?.typeId === "minecraft:player") {
        addRad(hitEntity, 256);
        try { hitEntity.playSound("random.fizz"); } catch {}
    }
    cleanupProjectile(projectile);
});
world.afterEvents.projectileHitBlock.subscribe((event) => {
    const projectile = event.projectile;
    if (projectile?.typeId !== CLOSED_CORE_PROJECTILE) return;
    const dimension = event.dimension;
    const location = event.location;
    for (const player of dimension.getPlayers({ location, maxDistance: 5 })) {
        addRad(player, 256);
        try { player.playSound("random.fizz"); } catch {}
    }
    cleanupProjectile(projectile);
});
world.afterEvents.entityHitEntity.subscribe((event) => {
    const damager = event.damagingEntity;
    if (!damager || damager.typeId !== "minecraft:player") return;
    maybeCloseHeldOpenCore(damager, 1000);
});
world.afterEvents.itemUse.subscribe((event) => {
    const source = event.source;
    const itemStack = event.itemStack;
    if (!source || source.typeId !== "minecraft:player" || !itemStack) return;
    const radReduction = FLASK_RAD_REDUCTION[itemStack.typeId];
    if (radReduction) {
        removeRad(source, radReduction);
        try { source.playSound("random.pop"); } catch {}
    }
    if (itemStack.typeId === OPEN_CORE_ID) {
        maybeCloseHeldOpenCore(source, 1000);
    }
});