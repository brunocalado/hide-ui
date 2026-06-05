import { MODULE_ID, PLAYER_CONFIG_STORAGE_KEY, falseySettings, SETTINGS_KEY, HIDDEN_USERS_KEY, PLAYER_CONFIG_FLAG_KEY } from "./constants.js";
import { registerSettings } from "./settings.js";
import { isFullGM } from "./helpers.js";

Hooks.on("init", () => {
   registerSettings();
});

Hooks.on("ready", async () => {
   const hiddenUsers = game.settings.get(MODULE_ID, HIDDEN_USERS_KEY);

   // Full GMs are never affected. All other users default to hidden if not explicitly exempted.
   const isPlayerUiOverridden = !isFullGM() && (hiddenUsers[game.user.id] !== false);

   const settings = game.settings.get(MODULE_ID, SETTINGS_KEY);

   // localStorage is checked first: it survives the page reload that setFlag triggers in V14,
   // so freshly saved settings are available immediately after the forced reload.
   // The server-side flag is the cross-browser fallback (set when the user saves the form).
   let playerConfig = null;
   try {
      const stored = localStorage.getItem(PLAYER_CONFIG_STORAGE_KEY);
      if (stored) playerConfig = JSON.parse(stored);
   } catch {}
   playerConfig ??= game.user.getFlag(MODULE_ID, PLAYER_CONFIG_FLAG_KEY) ?? foundry.utils.deepClone(falseySettings);

   if (
      playerConfig.hideNavigation?.complete ||
      (isPlayerUiOverridden && settings.hideNavigation?.complete)
   ) {
      hideElement("navigation");
   } else {
      if (playerConfig.hideNavigation?.navToggle || (isPlayerUiOverridden && settings.hideNavigation?.navToggle))
         hideElement("navToggle");
      if (playerConfig.hideNavigation?.sceneList || (isPlayerUiOverridden && settings.hideNavigation?.sceneList))
         hideElement("sceneList");
      if (playerConfig.hideNavigation?.bossBar || (isPlayerUiOverridden && settings.hideNavigation?.bossBar))
         hideElement("bossBar");
   }

   if (playerConfig.hideControls || (isPlayerUiOverridden && settings.hideControls)) {
      hideElement("controls");
   }

   if (
      playerConfig.hideSideBar?.complete ||
      (isPlayerUiOverridden && settings.hideSideBar?.complete)
   ) {
      hideElement("sidebar");
   } else {
      if (playerConfig.hideSideBar?.chatLog || (isPlayerUiOverridden && settings.hideSideBar?.chatLog))
         hideElement("chatLog");
      if (playerConfig.hideSideBar?.chatInput || (isPlayerUiOverridden && settings.hideSideBar?.chatInput))
         hideElement("chatInput");
      if (playerConfig.hideSideBar?.combatTracker || (isPlayerUiOverridden && settings.hideSideBar?.combatTracker))
         hideElement("combatTracker");
      if (playerConfig.hideSideBar?.scenesDirectory || (isPlayerUiOverridden && settings.hideSideBar?.scenesDirectory))
         hideElement("scenesDirectory");
      if (playerConfig.hideSideBar?.actorsDirectory || (isPlayerUiOverridden && settings.hideSideBar?.actorsDirectory))
         hideElement("actorsDirectory");
      if (playerConfig.hideSideBar?.itemsDirectory || (isPlayerUiOverridden && settings.hideSideBar?.itemsDirectory))
         hideElement("itemsDirectory");
      if (playerConfig.hideSideBar?.journalEntries || (isPlayerUiOverridden && settings.hideSideBar?.journalEntries))
         hideElement("journalEntries");
      if (playerConfig.hideSideBar?.rollableTables || (isPlayerUiOverridden && settings.hideSideBar?.rollableTables))
         hideElement("rollableTables");
      if (playerConfig.hideSideBar?.cardStacks || (isPlayerUiOverridden && settings.hideSideBar?.cardStacks))
         hideElement("cardStacks");
      if (playerConfig.hideSideBar?.macros || (isPlayerUiOverridden && settings.hideSideBar?.macros))
         hideElement("macros");
      if (playerConfig.hideSideBar?.audioPlaylists || (isPlayerUiOverridden && settings.hideSideBar?.audioPlaylists))
         hideElement("audioPlaylists");
      if (playerConfig.hideSideBar?.compendiumPacks || (isPlayerUiOverridden && settings.hideSideBar?.compendiumPacks))
         hideElement("compendiumPacks");
      if (playerConfig.hideSideBar?.gameSettings || (isPlayerUiOverridden && settings.hideSideBar?.gameSettings))
         hideElement("gameSettings");
      if (playerConfig.hideSideBar?.placeables || (isPlayerUiOverridden && settings.hideSideBar?.placeables))
         hideElement("placeables");

      // dice-so-nice hides its tab via its own setting rather than CSS
      if (game.modules.get("dice-so-nice")?.active) {
         if (playerConfig.hideSideBar?.diceSoNice || (isPlayerUiOverridden && settings.hideSideBar?.diceSoNice))
            await game.settings.set("dice-so-nice", "hideSidebarTab", true);
      }

      const sidebarSettings = {};
      for (const [key, value] of Object.entries(settings.hideSideBar ?? {})) {
         // diceSoNice is handled via the dice-so-nice API, not CSS — exclude it from layout logic
         if (key === "diceSoNice") continue;
         sidebarSettings[key] = (isPlayerUiOverridden && value) || playerConfig.hideSideBar?.[key];
      }

      // Only apply dynamic sidebar sizing when at least one tab is actually hidden,
      // so we don't alter the sidebar layout for users with no hidden elements.
      const hasSomeHiddenTabs = Object.entries(sidebarSettings)
         .filter(([key]) => key !== "complete")
         .some(([, v]) => v);
      if (hasSomeHiddenTabs) {
         document.body.classList.add("hide-ui-dynamic-sized-sidebar");
      }

      setFocusToFirstDisplayedTab(sidebarSettings);

      if (
         Object.entries(sidebarSettings)
            .filter(([key]) => key !== "complete")
            .every(([, value]) => value === true)
      ) {
         hideElement("sidebarToggle");
      }
   }

   if (playerConfig.hidePlayers || (isPlayerUiOverridden && settings.hidePlayers))
      hideElement("players");
   if (playerConfig.hideHotbar || (isPlayerUiOverridden && settings.hideHotbar))
      hideElement("hotbar");
   if (playerConfig.hidePlayerConfig || (isPlayerUiOverridden && settings.hidePlayerConfig))
      hideElement("player-config");
   if (playerConfig.hideTokenHUD || (isPlayerUiOverridden && settings.hideTokenHUD))
      hideElement("token-hud");

   if (game.modules.get("token-action-hud")?.active) {
      if (playerConfig.hideTokenActionHUD || (isPlayerUiOverridden && settings.hideTokenActionHUD))
         hideElement("token-action-hud");
   }

   if (game.modules.get("custom-hotbar")?.active) {
      if (playerConfig.hideCustomHotbar || (isPlayerUiOverridden && settings.hideCustomHotbar))
         document.body.classList.add("hide-ui-custom-hotbar");
   }
});

/**
 * Adds a body class to trigger CSS-based hiding for the given UI element key.
 * The class name is `hide-ui-<id>`, matching selectors in base.css.
 * @param {string} id - The element key (e.g. "sidebar", "hotbar", "controls").
 * @returns {void}
 */
const hideElement = (id) => {
   document.body.classList.add(`hide-ui-${id}`);
};

/**
 * Moves sidebar focus to the first tab still visible, then collapses the sidebar.
 * Prevents a blank active tab when the default chat tab has been hidden.
 * @param {Object} hideSideBarSettings - Map of sidebar keys to boolean (true = hidden).
 * @returns {void}
 */
const setFocusToFirstDisplayedTab = (hideSideBarSettings) => {
   try {
      if (!hideSideBarSettings.chatLog) return;

      const tabMap = {
         chatLog: "chat",
         combatTracker: "combat",
         scenesDirectory: "scenes",
         actorsDirectory: "actors",
         itemsDirectory: "items",
         journalEntries: "journal",
         rollableTables: "tables",
         cardStacks: "cards",
         macros: "macros",
         audioPlaylists: "playlists",
         compendiumPacks: "compendium",
         gameSettings: "settings",
         placeables: "placeables",
      };

      for (const [key, tab] of Object.entries(tabMap)) {
         if (hideSideBarSettings[key] === false) {
            document.querySelector(`button[data-tab="${tab}"]`)?.click();
            document.querySelector('#sidebar button[data-tooltip="Collapse"]')?.click();
            return;
         }
      }
   } catch {}
};
