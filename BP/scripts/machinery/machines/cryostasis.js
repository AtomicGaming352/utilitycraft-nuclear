import { Machine, FluidManager } from '../DoriosMachinery/core.js'
import { freezerRecipes } from "../../config/recipes/freezer.js";

const OUTPUTSLOT = 3

DoriosAPI.register.blockComponent('ryno_freezer', {

    beforeOnPlayerPlace(e, { params: settings }) {

        Machine.spawnMachineEntity(e, settings, () => {

            const machine = new Machine(e.block, settings, true);

            machine.setEnergyCost(settings.machine.energy_cost);

            machine.displayProgress()

            machine.entity.setItem(1, 'utilitycraft:arrow_right_0', 1, "")

        });
    },

    onTick(e, { params: settings }) {

        if (!worldLoaded) return;

        const { block } = e;

        const machine = new Machine(block, settings);

        if (!machine.valid) return

        /** @type {FluidManager} */
        const liquid = FluidManager.initializeSingle(machine.entity);

        liquid.transferFluids(block)

        const inv = machine.inv;

        // =============================
        // Validation
        // =============================

        if (liquid.type === 'empty') {

            machine.showWarning('No Liquid')

            liquid.display()

            return
        }

        const recipes = freezerRecipes

        const recipe = recipes[liquid.type]

        if (!recipe) {

            machine.showWarning('Invalid Liquid')

            liquid.display()

            return
        }

        const recipeAmount = recipe.amount ?? 1000

        const liquidAmount = liquid.getAmount()

        if (liquidAmount < recipeAmount) {

            machine.showWarning('Not Enough Liquid')

            liquid.display()

            return
        }

        const outputSlot = inv.getItem(OUTPUTSLOT)

        if (outputSlot && outputSlot.typeId !== recipe.item) {

            machine.showWarning('Output Blocked')

            liquid.display()

            return
        }

        // =============================
        // Processing
        // =============================

        const progress = machine.getProgress();

        const energyCost = recipe.cost ?? settings.machine.energy_cost;

        machine.setEnergyCost(energyCost)

        if (machine.energy.get() <= 0) {

            machine.showWarning('No Energy', false)

            liquid.display()

            return
        }

        const maxAmountToCraft = Math.floor(liquidAmount / recipeAmount)

        if (progress >= energyCost) {

            const processCount = Math.min(
                Math.floor(progress / energyCost),
                maxAmountToCraft
            )

            if (processCount > 0) {

                liquid.remove(recipeAmount * processCount)

                machine.entity.addItem(recipe.item, processCount)

                machine.addProgress(-processCount * energyCost)
            }

        } else {

            const consumption = machine.boosts.consumption

            const energyToConsume = Math.min(
                machine.energy.get(),
                machine.rate,
                maxAmountToCraft * energyCost * consumption
            )

            machine.energy.consume(energyToConsume)

            machine.addProgress(energyToConsume / consumption)

        }

        machine.on()

        machine.displayEnergy()

        machine.displayProgress()

        liquid.display()

        machine.showStatus('Running')

    },

    onPlayerBreak(e) {

        Machine.onDestroy(e);

    }
});
