import { system, world } from "@minecraft/server";

world.afterEvents.worldLoad.subscribe(() => {
    const newRecipes = {
        "utilitycraft:ryno_sulfuric_saltpeter|utilitycraft:ryno_empty_fuel_cell": { output: "utilitycraft:ryno_sulfuric_saltpeter_canister", required: 4 },
        "utilitycraft:ryno_lead_plate|minecraft:concrete": { output: "utilitycraft:ryno_reactor_concrete", required: 4 },
        "utilitycraft:ryno_lead_plate|utilitycraft:compressed_glass": { output: "utilitycraft:ryno_reactor_glass", required: 4 },
        "utilitycraft:ryno_refined_uranium|utilitycraft:ryno_empty_fuel_cell": { output: "utilitycraft:ryno_nuclear_fuel", required: 8 },
        "utilitycraft:ryno_sulfuric_acid_canister|utilitycraft:ryno_uranium_ingot": { output: "utilitycraft:ryno_refined_uranium_nugget", required: 2, amount: 1 }
    };

    system.sendScriptEvent("utilitycraft:register_infuser_recipe", JSON.stringify(newRecipes));
});
