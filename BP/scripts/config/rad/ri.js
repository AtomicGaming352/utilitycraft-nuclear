import { world, system } from "@minecraft/server";
const RAD_OBJECTIVE_ID = "rad";
const itemRadiation = new Map([
    ["utilitycraft:ryno_refined_uranium", 3.6],
    ["utilitycraft:ryno_refined_uranium_nugget", 0.4],
    ["utilitycraft:ryno_plutonium", 27],
    ["utilitycraft:ryno_plutonium_nugget", 3]
]);
const tierCaps = [
    { ids: ["utilitycraft:ryno_refined_uranium", "utilitycraft:ryno_refined_uranium_nugget"], cap: 100 },
    { ids: ["utilitycraft:ryno_plutonium", "utilitycraft:ryno_plutonium_nugget"], cap: 200 }
];
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
system.runInterval(() => {
    const radObjective = getOrCreateObjective(RAD_OBJECTIVE_ID, "Radiation");
    for (const player of world.getAllPlayers()) {
        const inventory = player.getComponent("minecraft:inventory")?.container;
        if (!inventory) continue;
        let totalRadiation = 0;
        const currentRad = getScore(radObjective, player);
        for (let i = 0; i < inventory.size; i++) {
            const item = inventory.getItem(i);
            if (!item) continue;
            const value = itemRadiation.get(item.typeId);
            if (!value) continue;
            totalRadiation += value * item.amount;
        }
        if (totalRadiation <= 0) continue;
        let allowed = totalRadiation;
        for (const tier of tierCaps) {
            const hasTierItem = tier.ids.some((id) => {
                for (let i = 0; i < inventory.size; i++) {
                    const item = inventory.getItem(i);
                    if (item?.typeId === id) return true;
                }
                return false;
            });
            if (hasTierItem && currentRad >= tier.cap) {
                allowed = 0;
                break;
            }
        }
        if (allowed > 0) {
            try {
                radObjective.setScore(player, currentRad + allowed);
            } catch {}
        }
    }
}, 20);