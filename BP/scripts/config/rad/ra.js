import { world, system, EquipmentSlot } from "@minecraft/server";
const RAD_PROTECTION_OBJECTIVE = "radprotection";
function getOrCreateObjective(id, displayName) {
    let objective = world.scoreboard.getObjective(id);
    if (!objective) objective = world.scoreboard.addObjective(id, displayName);
    return objective;
}
const radProtItems = {
    "utilitycraft:ryno_hazmat_mask": 3,
    "utilitycraft:ryno_hazmat_suit": 4,
    "utilitycraft:ryno_hazmat_trousers": 3,
    "utilitycraft:ryno_hazmat_boots": 2
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
