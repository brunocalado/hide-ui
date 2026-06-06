export const MODULE_ID = "hide-ui";

export const SETTINGS_KEY = "settings";
export const HIDDEN_USERS_KEY = "hiddenUsers";
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

