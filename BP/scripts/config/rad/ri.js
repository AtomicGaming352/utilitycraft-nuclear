import { world, system, EquipmentSlot } from "@minecraft/server";
const RAD_OBJECTIVE_ID = "rad";
const ITEM_RADIATION = new Map([
  ["utilitycraft:ryno_refined_uranium", 10],
  ["utilitycraft:ryno_refined_uranium_nugget", 2],
  ["utilitycraft:ryno_plutonium_ingot", 45],
  ["utilitycraft:ryno_plutonium_bit", 15],
  ["minecraft:iron_ingot", 1],
  ["minecraft:raw_iron", 1]
]);
function getOrCreateObjective(id, displayName) {
  let objective = world.scoreboard.getObjective(id);
  if (!objective) objective = world.scoreboard.addObjective(id, displayName);
  return objective;
}
function setScore(objective, player, value) {
  try { objective.setScore(player, Math.max(0, Math.floor(value))); return true; } 
  catch { return false; }
}
system.runInterval(() => {
  const radObjective = getOrCreateObjective(RAD_OBJECTIVE_ID, "Radiation");
  for (const player of world.getAllPlayers()) {
    const inventory = player.getComponent("minecraft:inventory")?.container;
    const equipment = player.getComponent("minecraft:equippable");
    if (!inventory) continue;
    let totalRadiation = 0;
    for (let i = 0; i < inventory.size; i++) {
      const item = inventory.getItem(i);
      if (!item) continue;
      const value = ITEM_RADIATION.get(item.typeId);
      if (value) totalRadiation += value * item.amount;
    }
    if (equipment) {
        const mainhand = equipment.getEquipment(EquipmentSlot.Mainhand);
        const offhand = equipment.getEquipment(EquipmentSlot.Offhand);
        if (mainhand && ITEM_RADIATION.has(mainhand.typeId)) {
            totalRadiation += (ITEM_RADIATION.get(mainhand.typeId) * mainhand.amount);
        }
        if (offhand && ITEM_RADIATION.has(offhand.typeId)) {
            totalRadiation += (ITEM_RADIATION.get(offhand.typeId) * offhand.amount);
        }
    }
    if (totalRadiation <= 0) continue;
    const currentRad = radObjective.getScore(player) ?? 0;
    setScore(radObjective, player, currentRad + totalRadiation);
  }
}, 200);
