import { world, system } from "@minecraft/server";

// Get or create objectives
let rad = world.scoreboard.getObjective("rad");
if (!rad) {
  rad = world.scoreboard.addObjective("rad", "Radiation");
}

let radProtection = world.scoreboard.getObjective("radprotection");
if (!radProtection) {
  radProtection = world.scoreboard.addObjective("radprotection", "Radiation Protection");
}

// Run every 3 seconds (60 ticks)
system.runInterval(() => {
  for (const player of world.getPlayers()) {

    // Get scores safely
    let radiation = rad.getScore(player) ?? 0;
    let protection = radProtection.getScore(player) ?? 0;

    // Condition
    if (radiation >= 32 && protection < 12) {
      player.addEffect("nausea", 80, { amplifier: 0 });
    }
  }
}, 400);
system.runInterval(() => {
  for (const player of world.getPlayers()) {

    // Get scores safely
    let radiation = rad.getScore(player) ?? 0;
    let protection = radProtection.getScore(player) ?? 0;

    // Condition
    if (radiation >= 48 && protection < 12) {
      player.addEffect("nausea", 100, { amplifier: 0 });
    }
  }
}, 360);
system.runInterval(() => {
  for (const player of world.getPlayers()) {

    // Get scores safely
    let radiation = rad.getScore(player) ?? 0;
    let protection = radProtection.getScore(player) ?? 0;

    // Condition
    if (radiation >= 64 && protection < 12) {
      player.addEffect("nausea", 120, { amplifier: 0 });
    }
  }
}, 320);
system.runInterval(() => {
  for (const player of world.getPlayers()) {

    // Get scores safely
    let radiation = rad.getScore(player) ?? 0;
    let protection = radProtection.getScore(player) ?? 0;

    // Condition
    if (radiation >= 80 && protection < 12) {
      player.addEffect("nausea", 140, { amplifier: 0 });
    }
  }
}, 280);
system.runInterval(() => {
  for (const player of world.getPlayers()) {

    // Get scores safely
    let radiation = rad.getScore(player) ?? 0;
    let protection = radProtection.getScore(player) ?? 0;

    // Condition
    if (radiation >= 96 && protection < 12) {
      player.addEffect("nausea", 160, { amplifier: 0 });
    }
  }
}, 240);
system.runInterval(() => {
  for (const player of world.getPlayers()) {

    // Get scores safely
    let radiation = rad.getScore(player) ?? 0;
    let protection = radProtection.getScore(player) ?? 0;

    // Condition
    if (radiation >= 128 && protection < 12) {
      player.addEffect("nausea", 200, { amplifier: 0 });
    }
  }
}, 200);
