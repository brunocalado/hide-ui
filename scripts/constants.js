export const MODULE_ID = "hide-ui";

export const SETTINGS_KEY = "settings";
export const HIDDEN_USERS_KEY = "hiddenUsers";
export const GM_CONFIGS_KEY = "gmConfigs";
export const PLAYER_CONFIG_FLAG_KEY = "playerConfig";
export const PLAYER_CONFIG_STORAGE_KEY = `${MODULE_ID}.${PLAYER_CONFIG_FLAG_KEY}`;
export const SOCKET_EVENT = `module.${MODULE_ID}`;

/**
 * Visibility mode for the Macro Hotbar, which supports auto-hide.
 * Legacy configs stored a boolean here; normalizeMode() (helpers.js) coerces it.
 * @typedef {"off"|"hide"|"autohide"} VisibilityMode
 */

/** Delay before the auto-hidden hotbar slides into its peek state, in milliseconds. */
export const AUTOHIDE_DELAY_MS = 3000;

export const truthySettings = {
   hideNavigation: {
      complete: true,
      navToggle: true,
      sceneList: true,
      sceneLevels: true,
      bossBar: true,
   },
   hideControls: true,
   hideSideBar: {
      complete: true,
      chatLog: true,
      chatInput: true,
      chatMenuBar: true,
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
   hideCameraViews: true,
   hideNotifications: true,
   hideNotificationsErrors: true,
   hideHotbar: "hide",
   hideHotbarControls: {
      lock: true,
      clear: true,
      menu: true,
      mute: true,
   },
   hidePlayerConfig: true,
   hideTokenHUD: true,
   hideTokenHUDControls: {
      statusEffects: true,
      movementAction: true,
      target: true,
      combat: true,
      hide: true,
      lock: true,
      config: true,
   },
   hideTokenActionHUD: true,
};

export const defaultSettings = {
   hideNavigation: {
      complete: false,
      navToggle: false,
      sceneList: false,
      sceneLevels: false,
      bossBar: false,
   },
   hideControls: false,
   hideSideBar: {
      complete: false,
      chatLog: false,
      chatInput: false,
      chatMenuBar: false,
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
         activeModules: true,
         tours: true,
         help: true,
      },
      macros: false,
      placeables: false,
      diceSoNice: true,
   },
   hidePlayers: false,
   hideCameraViews: false,
   hideNotifications: false,
   hideNotificationsErrors: false,
   hideHotbar: "off",
   hideHotbarControls: {
      lock: false,
      clear: false,
      menu: false,
      mute: false,
   },
   hidePlayerConfig: false,
   hideTokenHUD: false,
   hideTokenHUDControls: {
      statusEffects: false,
      movementAction: false,
      target: false,
      combat: false,
      hide: false,
      lock: false,
      config: false,
   },
   hideTokenActionHUD: false,
};

export const falseySettings = {
   hideNavigation: {
      complete: false,
      navToggle: false,
      sceneList: false,
      sceneLevels: false,
      bossBar: false,
   },
   hideControls: false,
   hideSideBar: {
      complete: false,
      chatLog: false,
      chatInput: false,
      chatMenuBar: false,
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
   hideCameraViews: false,
   hideNotifications: false,
   hideNotificationsErrors: false,
   hideHotbar: "off",
   hideHotbarControls: {
      lock: false,
      clear: false,
      menu: false,
      mute: false,
   },
   hidePlayerConfig: false,
   hideTokenHUD: false,
   hideTokenHUDControls: {
      statusEffects: false,
      movementAction: false,
      target: false,
      combat: false,
      hide: false,
      lock: false,
      config: false,
   },
   hideTokenActionHUD: false,
};

