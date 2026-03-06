import { Machine } from '../DoriosMachinery/core.js'
import { infuserRecipes } from "../../config/recipes/infuser.js"

const INPUTSLOT = 3
const CATALYST_SLOTS = [4,5,6]

DoriosAPI.register.blockComponent('blender_machine', {

beforeOnPlayerPlace(e,{params:settings}){

Machine.spawnMachineEntity(e,settings,()=>{

const machine = new Machine(e.block,settings,true)

machine.setEnergyCost(settings.machine.energy_cost)

machine.displayProgress()

machine.entity.setItem(1,'utilitycraft:arrow_indicator_90',1,"")

})

},

onTick(e,{params:settings}){

if(!worldLoaded) return

const {block} = e

const machine = new Machine(block,settings)

if(!machine.valid) return

machine.transferItems()

const inv = machine.inv
const OUTPUTSLOT = inv.size-1

/* INPUT */

const inputSlot = inv.getItem(INPUTSLOT)

if(!inputSlot){

machine.showWarning('No Base Item')
return

}

/* CATALYST SLOTS */

const catalysts = CATALYST_SLOTS
.map(slot=>({slot,item:inv.getItem(slot)}))
.filter(c=>c.item)

if(catalysts.length==0){

machine.showWarning('No Catalyst')
return

}

/* RECIPES */

const recipesComponent = block
.getComponent("utilitycraft:machine_recipes")
?.customComponentParameters?.params

let recipes

if(recipesComponent?.type){
recipes = infuserRecipes
}else{
recipes = recipesComponent
}

if(!recipes){

machine.showWarning('No Recipes')
return

}

/* FIND RECIPE */

let recipe = null

for(const catalyst of catalysts){

const key = catalyst.item.typeId+"|"+inputSlot.typeId

if(recipes[key]){

recipe = recipes[key]
break

}

}

if(!recipe){

machine.showWarning('Invalid Recipe')
return

}

/* BUILD REQUIREMENT MAP */

const requirements = {}

const mainCatalyst = Object.keys(recipes)
.find(k=>recipes[k]==recipe)
.split("|")[0]

requirements[mainCatalyst] = recipe.required ?? 1

if(recipe.extra_catalysts){

for(const [id,amount] of Object.entries(recipe.extra_catalysts)){

requirements[id] = amount

}

}

/* COUNT CATALYSTS IN INVENTORY */

const catalystCounts = {}

for(const c of catalysts){

const id = c.item.typeId

if(!catalystCounts[id]) catalystCounts[id]=0

catalystCounts[id]+=c.item.amount

}

/* VALIDATE REQUIREMENTS */

for(const [id,amount] of Object.entries(requirements)){

if((catalystCounts[id]??0)<amount){

machine.showWarning(`Needs ${amount} ${id}`)
return

}

}

/* OUTPUT CHECK */

const outputSlot = inv.getItem(OUTPUTSLOT)

if(outputSlot && outputSlot.typeId!=recipe.output){

machine.showWarning('Recipe Conflict')
return

}

const spaceLeft = (outputSlot?.maxAmount??64)-(outputSlot?.amount??0)

const recipeAmount = recipe.amount??1

if(recipeAmount>spaceLeft){

machine.showWarning('Output Full')
return

}

/* ENERGY */

const progress = machine.getProgress()

const energyCost = recipe.cost ?? settings.machine.energy_cost

machine.setEnergyCost(energyCost)

if(machine.energy.get()<=0){

machine.showWarning('No Energy',false)
return

}

/* CRAFT */

if(progress>=energyCost){

const processCount = Math.floor(progress/energyCost)

if(processCount>0){

if(!outputSlot){

machine.entity.setItem(
OUTPUTSLOT,
recipe.output,
processCount*recipeAmount
)

}else{

machine.entity.changeItemAmount(
OUTPUTSLOT,
processCount*recipeAmount
)

}

/* REMOVE INPUT */

machine.entity.changeItemAmount(
INPUTSLOT,
-processCount*(recipe.input_required??1)
)

/* REMOVE CATALYSTS */

for(const [id,amount] of Object.entries(requirements)){

let remaining = amount*processCount

for(const c of catalysts){

if(c.item.typeId!=id) continue

const remove = Math.min(remaining,c.item.amount)

machine.entity.changeItemAmount(
c.slot,
-remove
)

remaining-=remove

if(remaining<=0) break

}

}

machine.addProgress(-processCount*energyCost)

}

}else{

const consumption = machine.boosts.consumption

const energyToConsume = Math.min(
machine.energy.get(),
machine.rate,
energyCost*consumption
)

machine.energy.consume(energyToConsume)

machine.addProgress(energyToConsume/consumption)

}

machine.on()

machine.displayEnergy()

machine.displayProgress()

machine.showStatus('Blending')

},

onPlayerBreak(e){

Machine.onDestroy(e)

}

})
