import { system, world } from "@minecraft/server";

world.afterEvents.worldLoad.subscribe(() => {
    const newRecipes = {
      "utilitycraft:ryno_deepslate_lead_chunk": { output: "utlitycraft:ryno_raw_lead", required: 1 },
      "utilitycraft:ryno_deepslate_uranium_chunk": { output: "utlitycraft:ryno_raw_uranium", required: 1 },
      "utilitycraft:ryno_deepslate_vanadium_chunk": { output: "utlitycraft:ryno_raw_vanadium", required: 1 },
      "utilitycraft:ryno_vanadium_chunk": { output: "utlitycraft:ryno_raw_vanadium", required: 1 },
    };

    system.sendScriptEvent("utilitycraft:register_crusher_recipe", JSON.stringify(newRecipes));
});
