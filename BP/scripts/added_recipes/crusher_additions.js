import { system, world } from "@minecraft/server";

world.afterEvents.worldLoad.subscribe(() => {
    const newRecipes = {
      "utilitycraft:ryno_deepslate_lead_chunk": { output: "utilitycraft:ryno_raw_lead", required: 1 },
      "utilitycraft:ryno_deepslate_uranium_chunk": { output: "utilitycraft:ryno_raw_uranium", required: 1 },
      "utilitycraft:ryno_deepslate_vanadium_chunk": { output: "utilitycraft:ryno_raw_vanadium", required: 1 },
      "utilitycraft:ryno_vanadium_chunk": { output: "utilitycraft:ryno_raw_vanadium", required: 1 },
      "utilitycraft:ryno_raw_lead": { output: "utilitycraft:ryno_lead_dust", amount: 2, required: 1 },
      "utilitycraft:ryno_raw_uranium": { output: "utilitycraft:ryno_uranium_dust", amount: 2, required: 1 },
      "utilitycraft:ryno_raw_vanadium": { output: "utilitycraft:ryno_vanadium_dust", amount: 2, required: 1 },
      "utilitycraft:ryno_lead_plate": { output: "utilitycraft:ryno_lead_dust", amount: 1, required: 1 },
      "utilitycraft:ryno_lead_ingot": { output: "utilitycraft:ryno_lead_dust", amount: 1, required: 1 },
      "utilitycraft:ryno_uranium_ingot": { output: "utilitycraft:ryno_uranium_dust", amount: 1, required: 1 },
      "utilitycraft:ryno_vanadium_ingot": { output: "utilitycraft:ryno_vanadium_dust", amount: 1, required: 1 },
      "utilitycraft:ryno_sulfur_chunk": { output: "utilitycraft:ryno_sulfur_dust", amount: 4, required: 1 },
      "utilitycraft:ryno_deepslate_sulfur_chunk": { output: "utilitycraft:ryno_sulfur_dust", amount: 4, required: 1 },
    };

    system.sendScriptEvent("utilitycraft:register_crusher_recipe", JSON.stringify(newRecipes));
});
