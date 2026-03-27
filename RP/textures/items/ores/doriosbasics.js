// In your own script pack
import { system } from "@minecraft/server";

system.sendScriptEvent(
  "ftbquests:create_chapter",
  JSON.stringify({
    id: "dorios_basics",
    title: "dorios.basics.title",
    description: "dorios.basics.desc",
    icon: "utilitycraft:wooden_hammer",
  }),
);

system.sendScriptEvent(
  "ftbquests:add_quests",
  JSON.stringify({
    chapter_id: "dorios_basics",
    quests: [
      {
        id: "flint_string",
        name: "dorios.quests.flint_string.name",
        description: "dorios.quests.flint_string.desc",
        icon: "utilitycraft:flint_knife",
        tasks: {
          allOf: {
            "00": {
              type: "ftb_quest:item_collected",
              item_id: "utilitycraft:flint_knife",
            },
            "01" :{
              type: "ftb_quest:block_break",
              block_id: "minecraft:leaves",
            },
            "02": {
              type: "ftb_quest:item_collected",
              item_id: "utilitycraft:fiber",
              count: 4,
            },
            "03": {
              type: "ftb_quest:item_collected",
              item_id: "minecraft:string",
              count: 5,
            },
          },
        },
        rewards: [{ type: "ftb_quest:xp", amount: 10 }],
      },
      {
        id: "hammers",
        name: "dorios.quests.hammers.name",
        description: "dorios.quests.hammers.desc",
        icon: "minecraft:cooked_beef",
        tasks: {
          anyOf: {
            "00": {
              type: "ftb_quest:item_collected",
              item_id: "utilitycraft:wooden_hammer",
            },
            "01": {
              type: "ftb_quest:item_collected",
              item_id: "utilitycraft:stone_hammer",
            },
            "02": {
              type: "ftb_quest:item_collected",
              item_id: "utilitycraft:copper_hammer",
            },
            "03": {
              type: "ftb_quest:item_collected",
              item_id: "utilitycraft:iron_hammer",
            },
            "04": {
              type: "ftb_quest:item_collected",
              item_id: "utilitycraft:steel_hammer",
            },
            "05": {
              type: "ftb_quest:item_collected",
              item_id: "utilitycraft:gold_hammer",
            },
            "06": {
              type: "ftb_quest:item_collected",
              item_id: "utilitycraft:diamond_hammer",
            },
            "07": {
              type: "ftb_quest:item_collected",
              item_id: "utilitycraft:netherite_hammer",
            },
          },
        },
        rewards: [{ type: "ftb_quest:xp", amount: 10 }],
      },
    ],
  }),
);

system.sendScriptEvent("ftbquests:commit_chapter", JSON.stringify({ chapter_id: "dorios_basics" }));
