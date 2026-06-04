export const coolantValues = Object.freeze({
  'minecraft:ice': 2500,
  'minecraft:packed_ice': 25000,
  'minecraft:blue_ice': 50000,
  'utilitycraft:ryno_coolant_cell': 250000,
});
export const validCoolants = new Set(Object.keys(coolantValues));
export function getCoolantValue(typeId) {
  return coolantValues[typeId] ?? 0;
}
export const newReactorRecipes = [
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
    de: 1920000,
    byproduct: 'neoutility:plutonium_bit',
    byproduct_amount: 1,
    byproduct_range: [0, 1],
  },
  {
    input: 'neoutility:neptunic_fuel',
    de: 22560000,
    byproduct: 'neoutility:plutonium_bit',
    byproduct_amount: 1,
    byproduct_range: [1, 2],
  },
];
export const newReactorRecipeIndex = Object.fromEntries(
  newReactorRecipes.map((recipe, index) => [recipe.input, index])
);
