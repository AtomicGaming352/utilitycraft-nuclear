import { system, world } from "@minecraft/server";

world.afterEvents.worldLoad.subscribe(() => {
    const newRecipes = {
        "utilitycraft:ryno_lead_ingot": { output: "utilitycraft:ryno_lead_plate", required: 1 },
        "utilitycraft:ryno_lead_plate": { output: "utilitycraft:ryno_lead_plating", required: 3 },
    };

    system.sendScriptEvent("utilitycraft:register_press_recipe", JSON.stringify(newRecipes));
});
