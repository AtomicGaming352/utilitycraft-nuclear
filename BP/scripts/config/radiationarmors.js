import { world, system, EquipmentSlot } from "@minecraft/server";

// Get or create scoreboard
let radProtection = world.scoreboard.getObjective("radprotection");
if (!radProtection) {
  radProtection = world.scoreboard.addObjective("radprotection", "Radiation Protection");
}

// Item → protection values
const radProtItems = {
  // HELMETS
  "minecraft:leather_helmet": 1,
  "minecraft:iron_helmet": 2,
  "minecraft:diamond_helmet": 3,
  "minecraft:netherite_helmet": 4,

  // CHESTPLATES
  "minecraft:leather_chestplate": 1,
  "minecraft:iron_chestplate": 2,
  "minecraft:diamond_chestplate": 3,
  "minecraft:netherite_chestplate": 4,

  // LEGGINGS
  "minecraft:leather_leggings": 1,
  "minecraft:iron_leggings": 2,
  "minecraft:diamond_leggings": 3,
  "minecraft:netherite_leggings": 4,

  // BOOTS
  "minecraft:leather_boots": 1,
  "minecraft:iron_boots": 2,
  "minecraft:diamond_boots": 3,
  "minecraft:netherite_boots": 4
};

system.runInterval(() => {
  for (const player of world.getPlayers()) {

    let totalProtection = 0;

    const equipment = player.getComponent("minecraft:equippable");
    if (!equipment) continue;

    // All armor slots
    const slots = [
      EquipmentSlot.Head,
      EquipmentSlot.Chest,
      EquipmentSlot.Legs,
      EquipmentSlot.Feet
    ];

    for (const slot of slots) {
      const item = equipment.getEquipment(slot);
      if (!item) continue;

      const value = radProtItems[item.typeId];
      if (value) {
        totalProtection += value;
      }
    }

    // Set total protection
    radProtection.setScore(player, totalProtection);
  }
}, 20);
