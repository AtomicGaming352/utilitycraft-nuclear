// In your own script pack
import { system } from "@minecraft/server";

system.sendScriptEvent(
  "ftbquests:create_chapter",
  JSON.stringify({
    id: "dorios_basics",
    title: "api.demo.title",
    description: "api.demo.desc",
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
              type: "ftb_quest:item_collected",
              item_id: "utilitycraft:flint_knife",
            },
          },
        },
        rewards: [{ type: "ftb_quest:item", item: "minecraft:diamond", count: 3 }],
      },
      {
        id: "cook_beef",
        name: "api.demo.cook_beef.name",
        description: "api.demo.cook_beef.desc",
        icon: "minecraft:cooked_beef",
        tasks: {
          anyOf: {
            "00": {
              type: "ftb_quest:item_use_complete",
              item_id: "minecraft:cooked_beef",
              consumes_item: true,
            },
          },
        },
        rewards: [{ type: "ftb_quest:item", item: "minecraft:diamond", count: 3 }],
      },
    ],
  }),
);

system.sendScriptEvent("ftbquests:commit_chapter", JSON.stringify({ chapter_id: "api_demo" }));
