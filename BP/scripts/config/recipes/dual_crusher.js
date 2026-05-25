export const dualCrusherRecipes = {
    "minecraft:sand": {
        output: "minecraft:sand",
        amount: 1,
        primary_chance: 0.85,
        secondary_output: "minecraft:gold_nugget",
        secondary_amount: 1,
        secondary_chance: 1,
        required: 1,
        cost: 800,
        tier: 0
    },
    "minecraft:stone": {
        output: "minecraft:cobblestone",
        amount: 1,
        primary_chance: 1,
        secondary_output: "minecraft:flint",
        secondary_amount: 1,
        secondary_chance: 0.15,
        required: 1,
        cost: 800,
        tier: 0
    },
    "minecraft:cobblestone": {
        output: "minecraft:gravel",
        amount: 1,
        primary_chance: 1,
        secondary_output: "minecraft:flint",
        secondary_amount: 1,
        secondary_chance: 0.50,
        required: 1,
        cost: 800,
        tier: 0
    },
    "minecraft:gravel": {
        output: "minecraft:dirt",
        amount: 1,
        primary_chance: 1,
        secondary_output: "minecraft:clay_ball",
        secondary_amount: 1,
        secondary_chance: 0.35,
        required: 1,
        cost: 800,
        tier: 0
    }
};