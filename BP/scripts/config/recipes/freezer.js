import { world, system } from "@minecraft/server";

/**
 * @typedef {Object} FreezerRecipe
 * @property {string} item   The resulting item identifier.
 * @property {number} amount Liquid amount required in millibuckets (mB).
 */

/**
 * Recipes for the Freezer machine.
 *
 * Each key represents a liquid identifier,
 * and its value specifies the resulting item and required amount.
 *
 * @constant
 * @type {Record<string, FreezerRecipe>}
 */
export const freezerRecipes = {}

const freezerRecipesRegister = {

    "lava": { item: "minecraft:cobblestone", amount: 250 },

    "water": { item: "minecraft:ice", amount: 1000 }

};

world.afterEvents.worldLoad.subscribe(() => {

    system.sendScriptEvent(
        "utilitycraft:register_freezer_recipe",
        JSON.stringify(freezerRecipesRegister)
    );

});

/**
 * ScriptEvent receiver: "utilitycraft:register_freezer_recipe"
 *
 * Allows other addons or scripts to dynamically add or replace Freezer recipes.
 *
 * Expected payload format:
 *
 * {
 *   "lava": { "item": "minecraft:cobblestone", "amount": 250 },
 *   "water": { "item": "minecraft:ice", "amount": 1000 }
 * }
 */

system.afterEvents.scriptEventReceive.subscribe(({ id, message }) => {

    if (id !== "utilitycraft:register_freezer_recipe") return;

    try {

        const payload = JSON.parse(message);

        if (!payload || typeof payload !== "object") return;

        for (const [liquidType, data] of Object.entries(payload)) {

            if (!data.item || typeof data.item !== "string") continue;

            if (typeof data.amount !== "number") continue;

            freezerRecipes[liquidType] = data;

        }

    } catch (err) {

        console.warn("[UtilityCraft] Failed to parse freezer registration payload:", err);

    }

});

// ==================================================
// EXAMPLES – Register custom Freezer recipes
// ==================================================
/*
world.afterEvents.worldLoad.subscribe(() => {

    const newRecipes = {

        "lava": { item: "minecraft:stone", amount: 500 },

        "water": { item: "minecraft:snow_block", amount: 1000 }

    };

    system.sendScriptEvent(
        "utilitycraft:register_freezer_recipe",
        JSON.stringify(newRecipes)
    );

});
*/
