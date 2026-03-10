import { system, world } from "@minecraft/server";

world.afterEvents.worldLoad.subscribe(() => {
    // Add new custom drops for blocks
    // You can add drops to existing blocks (like gravel)
    // or define completely new ones that didn’t exist before.
    const newDrops = {
        "utilitycraft:crushed_cobbled_deepslate": [
            { item: "utilitycraft:ryno_lead_chunk", amount: 1, chance: 0.15, tier: 4 },
            { item: "utilitycraft:ryno_uranium_chunk", amount: 1, chance: 0.1, tier: 5 }
        ],
        "minecraft:sand" [
            { item: "utilitycraft:ryno_sulfur_chunk", amount: 1, chance: 0.35, tier 2 },
            { item: "utilitycraft:ryno_saltpeter", amount: 1, chance: 0.59, tier 1 }
        ]
    };

    // Send the event to the sieve script
    // This tells UtilityCraft to register your new drops dynamically.
    system.sendScriptEvent("utilitycraft:register_sieve_drop", JSON.stringify(newDrops));

    console.warn("[UC Nuclear] Custom sieve drops registered via system event.");
});
