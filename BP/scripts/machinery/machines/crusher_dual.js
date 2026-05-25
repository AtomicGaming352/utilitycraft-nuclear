import { Machine } from "../../DoriosCore/machinery/index.js";
import { ItemStack } from "@minecraft/server";
import { crusherRecipes } from "../../config/recipes/crusher.js";
import { dualCrusherRecipes } from "../../config/recipes/dual_crusher.js";
const INPUT_SLOT = 3;
const PRIMARY_OUTPUT_SLOT = 6;
const SECONDARY_OUTPUT_SLOT = 7;
function normalizeRecipeOutputs(recipe) {
    if (!recipe || typeof recipe !== 'object') return [];
    if (Array.isArray(recipe?.outputs) && recipe.outputs.length > 0) {
        return recipe.outputs
            .map((output, index) => ({
                slot: Number.isInteger(output.slot) ? output.slot : (index === 0 ? PRIMARY_OUTPUT_SLOT : SECONDARY_OUTPUT_SLOT),
                typeId: typeof output.item === 'string' ? output.item : output.typeId,
                amount: Number.isFinite(output.amount) ? Math.max(1, Math.floor(output.amount)) : 1,
                chance: typeof output.chance === 'number' ? Math.max(0, Math.min(1, output.chance)) : 1,
            }))
            .filter((output) => typeof output.typeId === 'string' && output.typeId.length > 0);
    }
    const outputs = [];
    if (typeof recipe?.output === 'string' && recipe.output.length > 0) {
        outputs.push({
            slot: PRIMARY_OUTPUT_SLOT,
            typeId: recipe.output,
            amount: Number.isFinite(recipe.amount) ? Math.max(1, Math.floor(recipe.amount)) : 1,
            chance: typeof recipe.primary_chance === 'number'
                ? Math.max(0, Math.min(1, recipe.primary_chance))
                : (typeof recipe.chance === 'number' ? Math.max(0, Math.min(1, recipe.chance)) : 1),
        });
    }
    if (typeof recipe?.secondary_output === 'string' && recipe.secondary_output.length > 0) {
        outputs.push({
            slot: SECONDARY_OUTPUT_SLOT,
            typeId: recipe.secondary_output,
            amount: Number.isFinite(recipe.secondary_amount) ? Math.max(1, Math.floor(recipe.secondary_amount)) : 1,
            chance: typeof recipe.secondary_chance === 'number' ? Math.max(0, Math.min(1, recipe.secondary_chance)) : 1,
        });
    }
    return outputs;
}
function getRecipesFromBlock() {
    return {
        priority: dualCrusherRecipes,
        fallback: crusherRecipes,
    };
}
function resolveRecipe(recipePack, inputId) {
    const priorityRecipe = recipePack?.priority?.[inputId];
    if (priorityRecipe) return priorityRecipe;
    return recipePack?.fallback?.[inputId] ?? null;
}
function rollOutputs(outputs) {
    const rolled = [];
    for (const output of outputs) {
        const chance = Math.max(0, Math.min(1, Number(output.chance ?? 1)));
        if (chance <= 0) continue;
        if (chance < 1 && Math.random() > chance) continue;
        rolled.push({
            slot: output.slot,
            typeId: output.typeId,
            amount: Math.max(1, Math.floor(output.amount ?? 1)),
        });
    }
    return rolled;
}
function outputsCanFit(container, outputs) {
    if (!container || !Array.isArray(outputs)) return false;
    for (const output of outputs) {
        if (!Number.isInteger(output.slot) || output.slot < 0 || output.slot >= container.size) return false;
        const existing = container.getItem(output.slot);
        if (!existing) continue;
        if (existing.typeId !== output.typeId) return false;
        const maxStack = existing.maxAmount ?? 64;
        if (existing.amount + output.amount > maxStack) return false;
    }
    return true;
}
function insertOutputs(container, outputs) {
    for (const output of outputs) {
        const item = new ItemStack(output.typeId, output.amount);
        const existing = container.getItem(output.slot);
        if (existing && existing.typeId === item.typeId) {
            const maxStack = existing.maxAmount ?? 64;
            const nextAmount = Math.min(maxStack, existing.amount + item.amount);
            existing.amount = nextAmount;
            container.setItem(output.slot, existing);
        } else {
            container.setItem(output.slot, item);
        }
    }
}
const crusherDualComponent = {
    beforeOnPlayerPlace(e, { params: settings }) {
        Machine.spawnEntity(e, settings, (entity) => {
            entity.setItem(1, 'utilitycraft:arrow_right_0', 1);
        });
    },
    onTick(e, { params: settings }) {
        const { block } = e;
        const machine = new Machine(block, settings);
        if (!machine.valid) return;
        machine.transferItems();
        const inv = machine.container;
        const inputSlot = inv.getItem(INPUT_SLOT);
        if (!inputSlot) {
            machine.showWarning('No Input Item');
            return;
        }
        const recipePack = getRecipesFromBlock(block);
        const recipe = resolveRecipe(recipePack, inputSlot.typeId);
        if (!recipe) {
            machine.showWarning('Invalid Recipe');
            return;
        }
        const requiredInput = recipe.required ?? 1;
        if (inputSlot.amount < requiredInput) {
            machine.showWarning(`Needs ${requiredInput} Items`);
            return;
        }
        const energyCost = recipe.cost ?? settings.machine.energy_cost;
        machine.setEnergyCost(energyCost);
        const outputs = normalizeRecipeOutputs(recipe);
        if (outputs.length === 0) {
            machine.showWarning('Invalid Recipe');
            return;
        }
        const guaranteedOutputs = outputs.filter((output) => output.chance >= 1);
        if (guaranteedOutputs.length > 0 && !outputsCanFit(inv, guaranteedOutputs)) {
            machine.showWarning('Output Full');
            return;
        }
        if (machine.energy.get() <= 0) {
            machine.showWarning('No Energy', { resetProgress: false });
            return;
        }
        const progress = machine.getProgress();
        if (progress >= energyCost) {
            const possibleCrafts = Math.min(
                Math.floor(progress / energyCost),
                Math.floor(inputSlot.amount / requiredInput)
            );
            let crafted = 0;
            for (let i = 0; i < possibleCrafts; i++) {
                const rolledOutputs = rollOutputs(outputs);
                if (rolledOutputs.length > 0 && !outputsCanFit(inv, rolledOutputs)) {
                    machine.showWarning('Output Full');
                    break;
                }
                if (rolledOutputs.length > 0) insertOutputs(inv, rolledOutputs);
                machine.addProgress(-energyCost);
                machine.entity.changeItemAmount(INPUT_SLOT, -requiredInput);
                crafted++;
            }
            machine.on();
            machine.displayEnergy();
            machine.displayProgress();
            machine.showStatus(crafted > 0 ? 'Running' : 'Waiting');
            return;
        }
        const consumption = machine.boosts.consumption;
        const energyToConsume = Math.min(machine.energy.get(), machine.rate);
        machine.energy.consume(energyToConsume);
        machine.addProgress(energyToConsume / consumption);
        machine.on();
        machine.displayEnergy();
        machine.displayProgress();
        machine.showStatus('Running');
    },
    onPlayerBreak(e) {
        Machine.onDestroy(e);
    }
};
DoriosAPI.register.blockComponent('crusher_dual', crusherDualComponent);
DoriosAPI.register.blockComponent('simple_machine_dual', crusherDualComponent);
