export const coolantValues = Object.freeze({
  'minecraft:ice': 400,
  'minecraft:packed_ice': 800,
  'minecraft:blue_ice': 2400,
  'minecraft:snow_block': 200,
  'minecraft:snowball': 50,
});
export const validCoolants = new Set(Object.keys(coolantValues));
export function getCoolantValue(typeId) {
  return coolantValues[typeId] ?? 0;
}
export const deFurnatorRecipes = [
  {
    input: 'minecraft:coal_block',
    de: 8000,
    byproduct: 'minecraft:coal',
    byproduct_amount: 1,
    byproduct_range: [1, 1],
  },
  {
    input: 'minecraft:dried_kelp_block',
    de: 400,
    byproduct: 'minecraft:dry_kelp',
    byproduct_amount: 1,
    byproduct_range: [0, 1],
  },
  {
    input: 'minecraft:coal',
    de: 1000,
    byproduct: 'minecraft:charcoal',
    byproduct_amount: 1,
    byproduct_range: [1, 1],
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