import { world, system } from "@minecraft/server";

// Get or create radiation scoreboard
let rad = world.scoreboard.getObjective("rad");
if (!rad) {
  rad = world.scoreboard.addObjective("rad", "Radiation");
}

// Define tiers with cap
const radiationTiers = {
  1: { items: ["utilitycraft:ryno_refined_uranium", "utilitycraft:ryno_refined_uranium_nugget"], cap: 128 },
  2: { items: ["utilitycraft:ryno_plutonium", "utilitycraft:ryno_plutonium_nugget"], cap: 256 }
};

// Assign radiation values per item (can also be per tier)
const radiationValues = {
  "utilitycraft:ryno_refined_uranium": 3.6,
  "utilitycraft:ryno_refined_uranium_nugget": 0.4,
  "utilitycraft:ryno_plutonium": 27,
  "utilitycraft:ryno_plutonium_nugget": 3
};

system.runInterval(() => {
  for (const player of world.getPlayers()) {
    let currentRad = rad.getScore(player) ?? 0;
    let totalRadiation = 0;

    const inventory = player.getComponent("minecraft:inventory")?.container;
    if (!inventory) continue;

    // Loop through all slots
    for (let i = 0; i < inventory.size; i++) {
      const item = inventory.getItem(i);
      if (!item) continue;

      const itemId = item.typeId;
      const value = radiationValues[itemId];
      if (!value) continue;

      // Determine tier of this item
      let tierCap = null;
      for (const tier in radiationTiers) {
        if (radiationTiers[tier].items.includes(itemId)) {
          tierCap = radiationTiers[tier].cap;
          break;
        }
      }

      if (tierCap === null) continue; // not in any tier

      // Only add radiation if below the tier cap
      if (currentRad < tierCap) {
        totalRadiation += value * item.amount;
      }
    }

    if (totalRadiation > 0) {
      // Ensure we don’t go above the highest tier cap for the items present
      const newRad = Math.min(currentRad + totalRadiation, Math.max(...Object.values(radiationTiers).map(t => t.cap)));
      rad.setScore(player, newRad);
    }
  }
}, 80); // every 4 seconds
