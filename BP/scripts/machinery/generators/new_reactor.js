import { Generator } from "../../DoriosCore/machinery/index.js";
import { ItemStack } from '@minecraft/server';
import {
  newReactorRecipes,
  newReactorRecipeIndex,
  validCoolants,
  getCoolantValue,
} from '../../config/recipes/de_furnator.js';
const ENERGY_SLOT = 0;
const LABEL_SLOT = 1;
const PROGRESS_SLOT = 2;
const FUEL_SLOT = 3;
const COOLANT_SLOT = 4;
const OUTPUT_SLOT = 5;
const COOLANT_BAR_SLOT = 6;
const REMAINING_PROP = 'utilitycraft:de_remaining';
const TOTAL_PROP = 'utilitycraft:de_total';
const RECIPE_INDEX_PROP = 'utilitycraft:de_recipe_index';
const PENDING_PROP = 'utilitycraft:de_pending';
const BYPRODUCT_AMOUNT_PROP = 'utilitycraft:de_byproduct_amount';
const COOLANT_REMAINING_PROP = 'utilitycraft:coolant_remaining';
const COOLANT_TOTAL_PROP = 'utilitycraft:coolant_total';
const COOLANT_TYPE_PROP = 'utilitycraft:coolant_type';
function getContainer(entity) {
  return entity?.getComponent?.('minecraft:inventory')?.container;
}
function getStack(container, slot) {
  try {
    return container?.getItem(slot) ?? undefined;
  } catch {
    return undefined;
  }
}
function setStack(container, slot, stack) {
  try {
    container?.setItem(slot, stack);
    return true;
  } catch {
    return false;
  }
}
function consumeOne(container, slot) {
  const stack = getStack(container, slot);
  if (!stack) return false;
  if (stack.amount <= 1) {
    return setStack(container, slot, undefined);
  }
  stack.amount -= 1;
  return setStack(container, slot, stack);
}
function canFitOutput(container, slot, itemId, amount = 1) {
  const existing = getStack(container, slot);
  if (!existing) return true;
  if (existing.typeId !== itemId) return false;
  return existing.amount + amount <= existing.maxAmount;
}
function insertOutput(container, slot, itemId, amount = 1) {
  const existing = getStack(container, slot);
  if (!existing) {
    return setStack(container, slot, new ItemStack(itemId, amount));
  }
  if (existing.typeId !== itemId) return false;
  if (existing.amount + amount > existing.maxAmount) return false;
  existing.amount += amount;
  return setStack(container, slot, existing);
}
function clearFuelState(entity) {
  entity.setDynamicProperty(REMAINING_PROP, 0);
  entity.setDynamicProperty(TOTAL_PROP, 0);
  entity.setDynamicProperty(RECIPE_INDEX_PROP, -1);
  entity.setDynamicProperty(PENDING_PROP, 0);
  entity.setDynamicProperty(BYPRODUCT_AMOUNT_PROP, 0);
}
function clearAllState(entity) {
  clearFuelState(entity);
  entity.setDynamicProperty(COOLANT_REMAINING_PROP, 0);
  entity.setDynamicProperty(COOLANT_TOTAL_PROP, 0);
  entity.setDynamicProperty(COOLANT_TYPE_PROP, '');
}
function prettyName(typeId) {
  if (!typeId || typeof typeId !== 'string') return 'None';
  const raw = typeId.includes(':') ? typeId.split(':').pop() : typeId;
  return raw
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
function shorten(text, max = 24) {
  const value = String(text ?? '');
  return value.length > max ? `${value.slice(0, Math.max(0, max - 1))}…` : value;
}
function normalizeRange(range, fallbackMin = 0, fallbackMax = fallbackMin) {
  let min = Number(fallbackMin);
  let max = Number(fallbackMax);
  if (Array.isArray(range) && range.length >= 2) {
    const a = Number(range[0]);
    const b = Number(range[1]);
    if (Number.isFinite(a)) min = a;
    if (Number.isFinite(b)) max = b;
  }
  if (!Number.isFinite(min)) min = 0;
  if (!Number.isFinite(max)) max = min;
  min = Math.max(0, Math.floor(min));
  max = Math.max(0, Math.floor(max));
  if (max < min) [min, max] = [max, min];
  return [min, max];
}
function rollRange([min, max]) {
  const safeMin = Math.max(0, Math.floor(min || 0));
  const safeMax = Math.max(0, Math.floor(max || 0));
  if (safeMax <= safeMin) return safeMin;
  return safeMin + Math.floor(Math.random() * (safeMax - safeMin + 1));
}
function makeBar(current, total, width = 8) {
  const safeTotal = Math.max(1, Math.floor(total || 0));
  const safeCurrent = Math.max(0, Math.min(safeTotal, Math.floor(current || 0)));
  const filled = Math.max(0, Math.min(width, Math.round((safeCurrent / safeTotal) * width)));
  return `§8[§a${'█'.repeat(filled)}§7${'░'.repeat(width - filled)}§8]`;
}
function setBarItem(entity, slot, current, total) {
  const safeTotal = Math.max(1, Math.floor(total || 0));
  const safeCurrent = Math.max(0, Math.min(safeTotal, Math.floor(current || 0)));
  const frame = Math.max(0, Math.min(16, Math.round((safeCurrent / safeTotal) * 16)));
  entity.setItem(slot, `utilitycraft:fuel_bar_${frame}`, 1, ' ');
}
function setProgressBar(entity, remaining, total) {
  setBarItem(entity, PROGRESS_SLOT, Math.max(0, Math.floor((total || 0) - (remaining || 0))), total);
}
function updateCoolantBar(entity) {
  const current = Number(entity.getDynamicProperty(COOLANT_REMAINING_PROP) ?? 0);
  const total = Number(entity.getDynamicProperty(COOLANT_TOTAL_PROP) ?? 0);
  if (current > 0 && total > 0) {
    setBarItem(entity, COOLANT_BAR_SLOT, current, total);
    return;
  }
  setBarItem(entity, COOLANT_BAR_SLOT, 0, 1);
}
function setIdleDisplay(generator) {
  setProgressBar(generator.entity, 0, 1);
  updateCoolantBar(generator.entity);
  const coolantRemaining = Number(generator.entity.getDynamicProperty(COOLANT_REMAINING_PROP) ?? 0);
  const coolantTotal = Number(generator.entity.getDynamicProperty(COOLANT_TOTAL_PROP) ?? 0);
  const coolantType = shorten(prettyName(String(generator.entity.getDynamicProperty(COOLANT_TYPE_PROP) ?? '')), 16);
  const lines = [
    '§r§7Idle',
    coolantRemaining > 0 && coolantTotal > 0
      ? `§r§7Coolant: §f${coolantType} ${makeBar(coolantRemaining, coolantTotal, 8)}`
      : '§r§7Fuel + coolant buffer ready',
  ];
  generator.setLabel(lines.join('\n'), LABEL_SLOT);
  generator.displayEnergy(ENERGY_SLOT);
}
function setCycleDisplay(generator, recipe, remainingFuel, totalFuel, coolantRemaining, coolantTotal) {
  const fuelName = shorten(prettyName(recipe.input), 16);
  const coolantName = shorten(prettyName(String(generator.entity.getDynamicProperty(COOLANT_TYPE_PROP) ?? '')), 16);
  const fuelBar = makeBar(totalFuel - remainingFuel, totalFuel, 8);
  const coolantBar = makeBar(coolantRemaining, coolantTotal, 8);
  generator.setLabel([
    '§r§aRunning',
    `§r§7Fuel: §f${fuelName}`,
    `§r§7DE: §f${Math.max(0, Math.floor(totalFuel - remainingFuel))}/${Math.max(0, Math.floor(totalFuel))} ${fuelBar}`,
    `§r§7Coolant: §f${coolantName} ${coolantBar}`,
  ].join('\n'), LABEL_SLOT);
  generator.displayEnergy(ENERGY_SLOT);
}
function setWaitingDisplay(generator, title, subtitle, remainingFuel, totalFuel, coolantRemaining, coolantTotal) {
  const coolantType = shorten(prettyName(String(generator.entity.getDynamicProperty(COOLANT_TYPE_PROP) ?? '')), 16);
  const fuelBar = makeBar(totalFuel - remainingFuel, totalFuel, 8);
  const coolantBar = makeBar(coolantRemaining, coolantTotal, 8);
  generator.setLabel([
    `§r§e${title}`,
    `§r§7${subtitle}`,
    `§r§7Fuel: §f${Math.max(0, Math.floor(remainingFuel))}/${Math.max(0, Math.floor(totalFuel))} ${fuelBar}`,
    `§r§7Coolant: §f${coolantType} ${coolantBar}`,
  ].join('\n'), LABEL_SLOT);
  generator.displayEnergy(ENERGY_SLOT);
}
function findRecipe(typeId) {
  const index = deFurnatorRecipeIndex[typeId];
  if (typeof index !== 'number' || index < 0) return null;
  return { recipe: deFurnatorRecipes[index], index };
}
function getRecipeOutput(recipe) {
  const output = typeof recipe?.byproduct === 'string' ? recipe.byproduct : '';
  const fallbackAmount = Math.max(0, Math.floor(recipe?.byproduct_amount ?? 1));
  const range = normalizeRange(
    recipe?.byproduct_range
      ?? recipe?.output_range
      ?? recipe?.byproduct_amount_range
      ?? recipe?.range
      ?? recipe?.amount_range
      ?? [fallbackAmount, fallbackAmount],
    fallbackAmount,
    fallbackAmount,
  );
  if (!output) return null;
  return { output, range };
}
function loadNextCoolantUnit(entity, container) {
  const coolantStack = getStack(container, COOLANT_SLOT);
  if (!coolantStack) return false;
  if (!validCoolants.has(coolantStack.typeId)) return false;
  const total = getCoolantValue(coolantStack.typeId);
  if (total <= 0) return false;
  if (!consumeOne(container, COOLANT_SLOT)) return false;
  entity.setDynamicProperty(COOLANT_TYPE_PROP, coolantStack.typeId);
  entity.setDynamicProperty(COOLANT_TOTAL_PROP, total);
  entity.setDynamicProperty(COOLANT_REMAINING_PROP, total);
  updateCoolantBar(entity);
  return true;
}
function finishCycle(generator, entity, container, recipe) {
  const resolved = getRecipeOutput(recipe);
  if (resolved) {
    const byproductAmount = Math.max(0, Math.floor(entity.getDynamicProperty(BYPRODUCT_AMOUNT_PROP) ?? 0));
    const { output: byproduct } = resolved;
    if (byproductAmount > 0 && !canFitOutput(container, OUTPUT_SLOT, byproduct, byproductAmount)) {
      entity.setDynamicProperty(PENDING_PROP, 1);
      generator.on();
      setLabelSafe(generator, [
        '§r§eOutput Full',
        `§r§7Waiting: §f${shorten(prettyName(byproduct), 16)}`,
      ].join('\n'));
      generator.displayEnergy(ENERGY_SLOT);
      return false;
    }
    if (byproductAmount > 0) {
      if (!insertOutput(container, OUTPUT_SLOT, byproduct, byproductAmount)) {
        entity.setDynamicProperty(PENDING_PROP, 1);
        generator.on();
        setLabelSafe(generator, [
          '§r§eOutput Full',
          `§r§7Waiting: §f${shorten(prettyName(byproduct), 16)}`,
        ].join('\n'));
        generator.displayEnergy(ENERGY_SLOT);
        return false;
      }
    }
  }
  clearFuelState(entity);
  generator.off();
  setIdleDisplay(generator);
  return true;
}
function setLabelSafe(generator, text) {
  generator.setLabel(String(text ?? '').slice(0, 240), LABEL_SLOT);
}
DoriosAPI.register.blockComponent('de_furnator', {
  beforeOnPlayerPlace(e, { params: settings }) {
    Generator.spawnEntity(e, settings, (entity) => {
      clearAllState(entity);
      const generator = new Generator(e.block, settings);
      if (!generator.valid) return;
      setIdleDisplay(generator);
      generator.off();
    });
  },
  onTick(e, { params: settings }) {
    const { block } = e;
    const generator = new Generator(block, settings);
    if (!generator.valid) return;
    const { entity, energy } = generator;
    const container = generator.container;
    if (!container) return;
    const rate = Math.max(1, Number(generator.rate || 20));
    energy.transferToNetwork(rate * 4);
    const outputStack = getStack(container, OUTPUT_SLOT);
    const pending = Number(entity.getDynamicProperty(PENDING_PROP) ?? 0);
    const recipeIndex = Number(entity.getDynamicProperty(RECIPE_INDEX_PROP) ?? -1);
    const recipe = recipeIndex >= 0 ? deFurnatorRecipes[recipeIndex] : null;
    const resolvedOutput = getRecipeOutput(recipe);
    if (outputStack && resolvedOutput && outputStack.typeId !== resolvedOutput.output) {
      block.dimension.spawnItem(outputStack, block.center());
      setStack(container, OUTPUT_SLOT, undefined);
    }
    if (pending === 1) {
      if (!recipe) {
        clearFuelState(entity);
        generator.off();
        setIdleDisplay(generator);
        return;
      }
      if (finishCycle(generator, entity, container, recipe)) return;
      setWaitingDisplay(generator, 'Output Full', 'Clear the output slot', 0, 1, Number(entity.getDynamicProperty(COOLANT_REMAINING_PROP) ?? 0), Number(entity.getDynamicProperty(COOLANT_TOTAL_PROP) ?? 0));
      updateCoolantBar(entity);
      return;
    }
    const remainingFuel = Number(entity.getDynamicProperty(REMAINING_PROP) ?? 0);
    const totalFuel = Number(entity.getDynamicProperty(TOTAL_PROP) ?? 0);
    let coolantRemaining = Number(entity.getDynamicProperty(COOLANT_REMAINING_PROP) ?? 0);
    let coolantTotal = Number(entity.getDynamicProperty(COOLANT_TOTAL_PROP) ?? 0);
    if (remainingFuel > 0 && totalFuel > 0 && recipe) {
      if (coolantRemaining <= 0) {
        const loaded = loadNextCoolantUnit(entity, container);
        if (!loaded) {
          generator.off();
          setWaitingDisplay(generator, 'No Coolant', 'Insert coolant to continue', remainingFuel, totalFuel, 0, Math.max(1, coolantTotal));
          updateCoolantBar(entity);
          return;
        }
        coolantRemaining = Number(entity.getDynamicProperty(COOLANT_REMAINING_PROP) ?? 0);
        coolantTotal = Number(entity.getDynamicProperty(COOLANT_TOTAL_PROP) ?? 0);
      }
      const freeSpace = energy.getFreeSpace();
      if (freeSpace <= 0) {
        generator.on();
        setWaitingDisplay(generator, 'Energy Full', 'Pause until energy is used', remainingFuel, totalFuel, coolantRemaining, coolantTotal);
        updateCoolantBar(entity);
        return;
      }
      const produced = Math.min(rate, remainingFuel, coolantRemaining, freeSpace);
      if (produced <= 0) {
        generator.off();
        setWaitingDisplay(generator, 'Paused', 'No usable DE this tick', remainingFuel, totalFuel, coolantRemaining, coolantTotal);
        updateCoolantBar(entity);
        return;
      }
      energy.add(produced);
      const nextFuel = remainingFuel - produced;
      const nextCoolant = coolantRemaining - produced;
      entity.setDynamicProperty(REMAINING_PROP, nextFuel);
      entity.setDynamicProperty(COOLANT_REMAINING_PROP, nextCoolant);
      entity.setDynamicProperty(COOLANT_TOTAL_PROP, coolantTotal);
      setProgressBar(entity, nextFuel, totalFuel);
      updateCoolantBar(entity);
      generator.on();
      if (nextFuel <= 0) {
        if (finishCycle(generator, entity, container, recipe)) return;
        setProgressBar(entity, 0, totalFuel);
        return;
      }
      if (nextCoolant <= 0) {
        const loaded = loadNextCoolantUnit(entity, container);
        if (!loaded) {
          generator.off();
          setWaitingDisplay(generator, 'No Coolant', 'Insert coolant to continue', nextFuel, totalFuel, 0, Math.max(1, coolantTotal));
          updateCoolantBar(entity);
          return;
        }
      }
      setCycleDisplay(
        generator,
        recipe,
        nextFuel,
        totalFuel,
        Number(entity.getDynamicProperty(COOLANT_REMAINING_PROP) ?? 0),
        Number(entity.getDynamicProperty(COOLANT_TOTAL_PROP) ?? 0)
      );
      return;
    }
    const fuelItem = getStack(container, FUEL_SLOT);
    const coolantItem = getStack(container, COOLANT_SLOT);
    if (!fuelItem) {
      clearFuelState(entity);
      generator.off();
      setIdleDisplay(generator);
      return;
    }
    const found = findRecipe(fuelItem.typeId);
    if (!found) {
      clearFuelState(entity);
      generator.off();
      setWaitingDisplay(generator, 'Invalid Fuel', shorten(prettyName(fuelItem.typeId), 20), 0, 1, coolantItem ? getCoolantValue(coolantItem.typeId) : coolantRemaining, coolantItem ? getCoolantValue(coolantItem.typeId) : Math.max(1, coolantTotal));
      setProgressBar(entity, 0, 1);
      updateCoolantBar(entity);
      return;
    }
    if (coolantRemaining <= 0) {
      if (!coolantItem) {
        generator.off();
        setWaitingDisplay(generator, 'No Coolant', 'Insert a valid coolant', 0, found.recipe.de, 0, 1);
        setProgressBar(entity, 0, found.recipe.de);
        updateCoolantBar(entity);
        return;
      }
      if (!validCoolants.has(coolantItem.typeId)) {
        generator.off();
        setWaitingDisplay(generator, 'Invalid Coolant', shorten(prettyName(coolantItem.typeId), 20), 0, found.recipe.de, 0, 1);
        setProgressBar(entity, 0, found.recipe.de);
        updateCoolantBar(entity);
        return;
      }
      if (!loadNextCoolantUnit(entity, container)) {
        generator.off();
        setWaitingDisplay(generator, 'No Coolant', 'Insert a valid coolant', 0, found.recipe.de, 0, 1);
        setProgressBar(entity, 0, found.recipe.de);
        updateCoolantBar(entity);
        return;
      }
    }
    const recipeOutput = getRecipeOutput(found.recipe);
    if (recipeOutput) {
      const plannedAmount = rollRange(recipeOutput.range);
      entity.setDynamicProperty(BYPRODUCT_AMOUNT_PROP, plannedAmount);
      if (plannedAmount > 0 && !canFitOutput(container, OUTPUT_SLOT, recipeOutput.output, plannedAmount)) {
        generator.off();
        setWaitingDisplay(generator, 'Output Full', 'Clear the output slot', 0, found.recipe.de, Number(entity.getDynamicProperty(COOLANT_REMAINING_PROP) ?? 0), Number(entity.getDynamicProperty(COOLANT_TOTAL_PROP) ?? 0));
        setProgressBar(entity, 0, found.recipe.de);
        updateCoolantBar(entity);
        return;
      }
    } else {
      entity.setDynamicProperty(BYPRODUCT_AMOUNT_PROP, 0);
    }
    if (!consumeOne(container, FUEL_SLOT)) {
      clearFuelState(entity);
      generator.off();
      setIdleDisplay(generator);
      return;
    }
    entity.setDynamicProperty(RECIPE_INDEX_PROP, found.index);
    entity.setDynamicProperty(TOTAL_PROP, found.recipe.de);
    entity.setDynamicProperty(REMAINING_PROP, found.recipe.de);
    entity.setDynamicProperty(PENDING_PROP, 0);
    setProgressBar(entity, found.recipe.de, found.recipe.de);
    updateCoolantBar(entity);
    generator.on();
    setCycleDisplay(
      generator,
      found.recipe,
      found.recipe.de,
      found.recipe.de,
      Number(entity.getDynamicProperty(COOLANT_REMAINING_PROP) ?? 0),
      Number(entity.getDynamicProperty(COOLANT_TOTAL_PROP) ?? 0)
    );
  },
  onPlayerBreak(e) {
    Generator.onDestroy(e);
  },
});
