import { world, system, ItemStack } from "@minecraft/server";
const RAD_SCOREBOARD = "rad";
const CLOSED_CORE_PROJECTILE = "neoutility:demon_core_closed_projectile";
const OPEN_CORE_ID = "neoutility:demon_core_open";
const CLOSED_CORE_ID = "neoutility:demon_core_closed";
const FLASK_RAD_REDUCTION = {
    "neoutility:lesser_purifying_flask": 50,
    "neoutility:purifying_flask": 100,
    "neoutility:greater_purifying_flask": 200
};
function getOrCreateObjective(id, displayName) {
    let objective = world.scoreboard.getObjective(id);
    if (!objective) objective = world.scoreboard.addObjective(id, displayName);
    return objective;
}
function getRadScore(target) {
    try {
        const obj = getOrCreateObjective(RAD_SCOREBOARD, "rad");
        return obj.getScore(target) ?? 0;
    } catch { return 0; }
}
function addRad(target, amount) {
    try {
        const obj = getOrCreateObjective(RAD_SCOREBOARD, "rad");
        const current = getRadScore(target);
        obj.setScore(target, current + amount);
    } catch {}
}
function removeRad(target, amount) {
    try {
        const obj = getOrCreateObjective(RAD_SCOREBOARD, "rad");
        const current = getRadScore(target);
        obj.setScore(target, Math.max(0, current - amount));
    } catch {}
}
function maybeCloseHeldOpenCore(player, chanceDenominator) {
    const inv = player.getComponent("minecraft:inventory")?.container;
    if (!inv) return false;
    const held = inv.getItem(player.selectedSlotIndex);
    if (!held || held.typeId !== OPEN_CORE_ID) return false;
    if (Math.floor(Math.random() * chanceDenominator) !== 0) return false;
    try {
        inv.setItem(player.selectedSlotIndex, new ItemStack(CLOSED_CORE_ID, held.amount));
        return true;
    } catch { return false; }
}
function isLiving(entity) {
    try { return !!entity?.isValid && !!entity.getComponent("minecraft:health"); } catch { return false; }
}
world.afterEvents.projectileHitEntity.subscribe((event) => {
    const projectile = event.projectile;
    if (projectile?.typeId !== CLOSED_CORE_PROJECTILE) return;
    const hitEntity = event.getEntityHit()?.entity;
    if (hitEntity && isLiving(hitEntity)) {
        addRad(hitEntity, 256);
        try { hitEntity.playSound("random.fizz"); } catch {}
    }
    system.run(() => { try { projectile.remove(); } catch {} });
});
world.afterEvents.projectileHitBlock.subscribe((event) => {
    const projectile = event.projectile;
    if (projectile?.typeId !== CLOSED_CORE_PROJECTILE) return;
    const nearbyEntities = event.dimension.getEntities({ location: event.location, maxDistance: 5 });
    for (const entity of nearbyEntities) {
        if (isLiving(entity)) {
            addRad(entity, 256);
            try { entity.playSound("random.fizz"); } catch {}
        }
    }
    system.run(() => { try { projectile.remove(); } catch {} });
});
world.afterEvents.entityHitEntity.subscribe((event) => {
    const damager = event.damagingEntity;
    if (damager?.typeId === "minecraft:player") maybeCloseHeldOpenCore(damager, 1000);
});
world.afterEvents.itemUse.subscribe((event) => {
    if (event.source.typeId !== "minecraft:player" || !event.itemStack) return;
    const reduction = FLASK_RAD_REDUCTION[event.itemStack.typeId];
    if (reduction) {
        removeRad(event.source, reduction);
        try { event.source.playSound("random.pop"); } catch {}
    }
    if (event.itemStack.typeId === OPEN_CORE_ID) {
        maybeCloseHeldOpenCore(event.source, 1000);
    }
});
