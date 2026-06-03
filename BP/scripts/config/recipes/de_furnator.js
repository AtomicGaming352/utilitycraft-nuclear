export const coolantValues = Object.freeze({
  'minecraft:ice': 400,
  'minecraft:packed_ice': 800,
  'minecraft:blue_ice': 2400,
  'utilitycraft:ryno_coolant_cell': 250000,
  'minecraft:snowball': 50,
});
export const validCoolants = new Set(Object.keys(coolantValues));
export function getCoolantValue(typeId) {
  return coolantValues[typeId] ?? 0;
}
export const deFurnatorRecipes = [
  {
    input: 'utilitycraft:ryno_nuclear_fuel',
    de: 2000000,
    byproduct: 'neoutility:neptunium_nugget',
    byproduct_amount: 1,
    byproduct_range: [1, 3],
  },
  {
    input: 'utilitycraft:ryno_refined_uranium',
    de: 160000,
    byproduct: 'neoutility:neptunium_bit',
    byproduct_amount: 1,
    byproduct_range: [0, 1],
  },
  {
    input: 'neoutility:fissiled_neptunium',
    de: 100000,
    byproduct: 'neoutility:plutonium_bit',
    byproduct_amount: 1,
    byproduct_range: [0, 1],
  },
  {
    input: 'minecraft:charcoal',
    de: 900,
    byproduct: 'minecraft:charcoal',
    byproduct_amount: 1,
    byproduct_range: [1, 1],
  },
  {
    input: 'minecraft:blaze_rod',
    de: 2400,
    byproduct: 'minecraft:blaze_powder',
    byproduct_amount: 1,
    byproduct_range: [1, 1],
  },
  {
    input: 'minecraft:oak_log',
    de: 300,
    byproduct: 'minecraft:charcoal',
    byproduct_amount: 1,
    byproduct_range: [0, 1],
  },
  {
    input: 'minecraft:spruce_log',
    de: 300,
    byproduct: 'minecraft:charcoal',
    byproduct_amount: 1,
    byproduct_range: [0, 1],
  },
  {
    input: 'minecraft:birch_log',
    de: 300,
    byproduct: 'minecraft:charcoal',
    byproduct_amount: 1,
    byproduct_range: [0, 1],
  },
  {
    input: 'minecraft:stick',
    de: 80,
    byproduct: 'minecraft:charcoal',
    byproduct_amount: 1,
    byproduct_range: [0, 1],
  },
];
export const deFurnatorRecipeIndex = Object.fromEntries(
  deFurnatorRecipes.map((recipe, index) => [recipe.input, index])
);
