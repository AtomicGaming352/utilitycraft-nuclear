import { world, system } from "@minecraft/server";

// Get or create radiation scoreboard
let rad = world.scoreboard.getObjective("rad");
if (!rad) {
  rad = world.scoreboard.addObjective("rad", "Radiation");
}

// Tier definitions: items, cap, interval in ticks (20 ticks = 1 sec)
const radiationTiers = {
  1: { items: ["utilitycraft:ryno_refined_uranium", "utilitycraft:ryno_refined_uranium_nugget"], cap: 100, interval: 160 }, // 8 sec
  2: { items: ["utilitycraft:ryno_plutonium", "utilitycraft:ryno_plutonium_nugget"], cap: 200, interval: 80 }         // 4 sec
};

// Radiation value per item (can be decimal)
const radiationValues = {
  "utilitycraft:ryno_refined_uranium": 3.6,
  "utilitycraft:ryno_refined_uranium_nugget": 0.4,
  "utilitycraft:ryno_plutonium": 27,
  "utilitycraft:ryno_plutonium_nugget": 3
};

// Track ticks for each tier
const tierTicks = {};
for (const tier in radiationTiers) {
  tierTicks[tier] = 0;
}

system.runInterval(() => {
  for (const player of world.getPlayers()) {
    let currentRad = rad.getScore(player) ?? 0;

    for (const tier in radiationTiers) {
      tierTicks[tier]++;

      // Only process this tier if its interval reached
      if (tierTicks[tier] >= radiationTiers[tier].interval) {
        tierTicks[tier] = 0;

        let totalRadiation = 0;
        const inventory = player.getComponent("minecraft:inventory")?.container;
        if (!inventory) continue;

        for (let i = 0; i < inventory.size; i++) {
          const item = inventory.getItem(i);
          if (!item) continue;

          const itemId = item.typeId;
          const value = radiationValues[itemId];
          if (!value) continue;

          if (radiationTiers[tier].items.includes(itemId) && currentRad < radiationTiers[tier].cap) {
            totalRadiation += value * item.amount;
          }
        }

        if (totalRadiation > 0) {
          const newRad = Math.min(currentRad + totalRadiation, radiationTiers[tier].cap);
          rad.setScore(player, newRad);
        }
      }
    }
  }
}, 20); // run every tick
