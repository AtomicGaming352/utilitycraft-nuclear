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

// Tier 1
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
}, 2400);
system.runInterval(() => {
  for (const player of world.getPlayers()) {

    // Get scores safely
    let radiation = rad.getScore(player) ?? 0;
    let protection = radProtection.getScore(player) ?? 0;

    // Condition
    if (radiation >= 64 && protection < 12) {
      player.addEffect("nausea", 100, { amplifier: 0 });
    }
  }
}, 2100);
system.runInterval(() => {
  for (const player of world.getPlayers()) {

    // Get scores safely
    let radiation = rad.getScore(player) ?? 0;
    let protection = radProtection.getScore(player) ?? 0;

    // Condition
    if (radiation >= 96 && protection < 12) {
      player.addEffect("nausea", 140, { amplifier: 0 });
    }
  }
}, 1800);
system.runInterval(() => {
  for (const player of world.getPlayers()) {

    // Get scores safely
    let radiation = rad.getScore(player) ?? 0;
    let protection = radProtection.getScore(player) ?? 0;

    // Condition
    if (radiation >= 128 && protection < 12) {
      player.addEffect("nausea", 180, { amplifier: 0 });
    }
  }
}, 1500);
// Tier 2
system.runInterval(() => {
  for (const player of world.getPlayers()) {

    // Get scores safely
    let radiation = rad.getScore(player) ?? 0;
    let protection = radProtection.getScore(player) ?? 0;

    // Condition
    if (radiation >= 144 && protection < 12) {
      player.addEffect("nausea", 80, { amplifier: 0 });
      player.addDamage(1);
    }
    else if (radiation >= 144 && protection < 24) {
      player.addEffect("nausea", 80, { amplifier: 0 });
    }
  }
}, 1200);
system.runInterval(() => {
  for (const player of world.getPlayers()) {

    // Get scores safely
    let radiation = rad.getScore(player) ?? 0;
    let protection = radProtection.getScore(player) ?? 0;

    // Condition
    if (radiation >= 160 && protection < 12) {
      player.addEffect("nausea", 100, { amplifier: 0 });
    }
  }
}, 1160);
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
}, 1120);
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
}, 1080);
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
// Tier 3(WIP)
