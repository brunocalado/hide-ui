import { MODULE_ID } from "./constants.js";
import { HideUISettingsForm } from "./connecting-players-settings-form.js";
import { HideUIPlayerConfigurationForm } from "./player-configuration-form.js";
import { HideUIUserConfigurationForm } from "./user-configuration-form.js";

export const truthySettings = {
   hideNavigation: {
      complete: true,
      navToggle: true,
      sceneList: true,
      bossBar: true,
   },
   hideControls: true,
   hideSideBar: {
      complete: true,
      chatLog: true,
      chatInput: true,
      combatTracker: true,
      scenesDirectory: true,
      actorsDirectory: true,
      itemsDirectory: true,
      journalEntries: true,
      rollableTables: true,
      cardStacks: true,
      audioPlaylists: true,
      compendiumPacks: true,
      gameSettings: true,
      macros: true,
   },
   hidePlayers: true,
   hideHotbar: true,
   hidePlayerConfig: true,
   hideTokenHUD: true,
   hideTokenActionHUD: true,
   hideCustomHotbar: true,
};

export const falseySettings = {
   hideNavigation: {
      complete: false,
      navToggle: false,
      sceneList: false,
      bossBar: false,
   },
   hideControls: false,
   hideSideBar: {
      complete: false,
      chatLog: false,
      chatInput: false,
      combatTracker: false,
      scenesDirectory: false,
      actorsDirectory: false,
      itemsDirectory: false,
      journalEntries: false,
      rollableTables: false,
      cardStacks: false,
      audioPlaylists: false,
      compendiumPacks: false,
      gameSettings: false,
      macros: false,
   },
   hidePlayers: false,
   hideHotbar: false,
   hidePlayerConfig: false,
   hideTokenHUD: false,
   hideTokenActionHUD: false,
   hideCustomHotbar: false,
};

export const registerSettings = () => {
   game.settings.registerMenu(MODULE_ID, "hide-ui-player-configuration", {
      name: "Personal UI",
      label: "Personal UI",
      hint: "Configure which UI elements to show or hide on your screen.",
      icon: "fas fa-eye-slash",
      type: HideUIPlayerConfigurationForm,
      restricted: false,
   });

   game.settings.registerMenu(MODULE_ID, "hide-ui-connecting-players", {
      name: "Players UI",
      label: "Players UI",
      hint: "Configure which UI elements to show or hide for connecting players.",
      icon: "fas fa-users-slash",
      type: HideUISettingsForm,
      restricted: true,
   });

   game.settings.registerMenu(MODULE_ID, "hide-ui-user-configuration", {
      name: "Player Visibility Settings",
      label: "Player Visibility",
      hint: "Choose which players have the hide settings applied to them. All new players are hidden by default.",
      icon: "fas fa-user-check",
      type: HideUIUserConfigurationForm,
      restricted: true,
   });

   game.settings.register(MODULE_ID, "settings", {
      name: "Hide UI Settings",
      scope: "world",
      default: truthySettings,
      type: Object,
      config: false,
   });

   // Maps user ID → boolean. true = apply hide settings; false = exempt.
   // Users absent from this map default to hidden on their next login.
   game.settings.register(MODULE_ID, "hiddenUsers", {
      name: "Hidden Users",
      scope: "world",
      default: {},
      type: Object,
      config: false,
   });
};
