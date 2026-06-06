export const MODULE_ID = "hide-ui";

export const SETTINGS_KEY = "settings";
export const HIDDEN_USERS_KEY = "hiddenUsers";
export const PLAYER_CONFIG_FLAG_KEY = "playerConfig";
export const PLAYER_CONFIG_STORAGE_KEY = `${MODULE_ID}.${PLAYER_CONFIG_FLAG_KEY}`;
export const SOCKET_EVENT = `module.${MODULE_ID}`;

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
      settingsContent: {
         gameSettings: true,
         activeModules: true,
         tours: true,
         help: true,
      },
      macros: true,
      placeables: true,
      diceSoNice: true,
   },
   hidePlayers: true,
   hideHotbar: true,
   hidePlayerConfig: true,
   hideTokenHUD: true,
   hideTokenActionHUD: true,
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
      settingsContent: {
         gameSettings: false,
         activeModules: false,
         tours: false,
         help: false,
      },
      macros: false,
      placeables: false,
      diceSoNice: false,
   },
   hidePlayers: false,
   hideHotbar: false,
   hidePlayerConfig: false,
   hideTokenHUD: false,
   hideTokenActionHUD: false,
   hideCustomHotbar: false,
};

