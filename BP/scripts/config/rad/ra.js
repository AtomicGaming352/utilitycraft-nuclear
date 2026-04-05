import { world, system, EquipmentSlot } from "@minecraft/server";
const RAD_PROTECTION_OBJECTIVE = "radprotection";
function getOrCreateObjective(id, displayName) {
    let objective = world.scoreboard.getObjective(id);
    if (!objective) objective = world.scoreboard.addObjective(id, displayName);
    return objective;
}
const radProtItems = {
    "minecraft:leather_helmet": 1,
    "minecraft:iron_helmet": 2,
    "minecraft:diamond_helmet": 3,
    "minecraft:netherite_helmet": 4,
    "minecraft:leather_chestplate": 1,
    "minecraft:iron_chestplate": 2,
    "minecraft:diamond_chestplate": 3,
    "minecraft:netherite_chestplate": 4,
    "minecraft:leather_leggings": 1,
    "minecraft:iron_leggings": 2,
    "minecraft:diamond_leggings": 3,
    "minecraft:netherite_leggings": 4,
    "minecraft:leather_boots": 1,
    "minecraft:iron_boots": 2,
    "minecraft:diamond_boots": 3,
    "minecraft:netherite_boots": 4
};
system.runInterval(() => {
    const radProtection = getOrCreateObjective(RAD_PROTECTION_OBJECTIVE, "Radiation Protection");
    for (const player of world.getAllPlayers()) {
        const equipment = player.getComponent("minecraft:equippable");
        if (!equipment) continue;
        let totalProtection = 0;
        for (const slot of [EquipmentSlot.Head, EquipmentSlot.Chest, EquipmentSlot.Legs, EquipmentSlot.Feet]) {
            const item = equipment.getEquipment(slot);
            if (!item) continue;
            totalProtection += radProtItems[item.typeId] ?? 0;
        }
        try {
            radProtection.setScore(player, totalProtection);
        } catch {}
    }
}, 20);