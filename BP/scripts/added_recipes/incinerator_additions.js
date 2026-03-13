import { system, world } from "@minecraft/server";

world.afterEvents.worldLoad.subscribe(() => {
    const newRecipes = {
        "utilitycraft:ryno_raw_lead": { output: "utilitycraft:ryno_lead_ingot" },
        "utilitycraft:ryno_lead_dust": { output: "utilitycraft:ryno_lead_ingot" },
        "utilitycraft:ryno_raw_uranium": { output: "utilitycraft:ryno_uranium_ingot" },
        "utilitycraft:ryno_uranium_dust": { output: "utilitycraft:ryno_uranium_ingot" },
        "utilitycraft:ryno_sulfuric_saltpeter_canister": { output: "utilitycraft:ryno_sulfuric_acid_canister" }
    };

    system.sendScriptEvent("utilitycraft:register_furnace_recipe", JSON.stringify(newRecipes));
});
