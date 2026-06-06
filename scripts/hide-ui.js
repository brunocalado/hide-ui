import { MODULE_ID, SETTINGS_KEY, HIDDEN_USERS_KEY, PLAYER_CONFIG_FLAG_KEY, PLAYER_CONFIG_STORAGE_KEY, falseySettings, truthySettings, SOCKET_EVENT } from "./constants.js";
import { registerSettings } from "./settings.js";
import { isFullGM } from "./helpers.js";

Hooks.on("init", () => {
   registerSettings();
});

Hooks.on("ready", async () => {
   if (!isFullGM()) {
      game.socket.on(SOCKET_EVENT, async (payload) => {
         if (payload?.type === "forceReset") {
            localStorage.removeItem(PLAYER_CONFIG_STORAGE_KEY);
            window.location.reload();
            return;
         }
         if (payload?.type !== "settingsUpdated") return;
         const reload = await foundry.applications.api.DialogV2.confirm({
            window: { title: "UI Settings Updated" },
            content: "<p>The GM has updated the UI settings. Reload now to apply the changes?</p>",
         });
         if (reload) window.location.reload();
      });
   }

   // Expose the reset utility for GM use from the browser console.
   globalThis.HideUI = {
      /**
       * Resets all module settings to defaults and reloads every connected client.
       * Intended as an escape hatch when the GM has accidentally hidden the settings UI.
       * Must be called from the GM's browser console (F12).
       * @returns {Promise<void>}
       */
      Reset: async () => {
         if (!isFullGM()) {
            ui.notifications.error("HideUI.Reset() can only be called by the GM.");
            return;
         }
         console.log(`[${MODULE_ID}] Resetting all module settings to defaults…`);
         await game.settings.set(MODULE_ID, SETTINGS_KEY, foundry.utils.deepClone(truthySettings));
         await game.settings.set(MODULE_ID, HIDDEN_USERS_KEY, {});
         await Promise.all(game.users.map(u => u.unsetFlag(MODULE_ID, PLAYER_CONFIG_FLAG_KEY)));
         game.socket.emit(SOCKET_EVENT, { type: "forceReset" });
         localStorage.removeItem(PLAYER_CONFIG_STORAGE_KEY);
         window.location.reload();
      },
   };

   // Determine what configuration to apply:
   // - GM: personal config stored in their user flag (Personal UI form).
   // - Non-GM overridden by GM: world settings from the Players UI form.
   // - Non-GM exempt: nothing to hide.
   let config;
   if (isFullGM()) {
      let playerConfig = null;
      try {
         const stored = localStorage.getItem(PLAYER_CONFIG_STORAGE_KEY);
         if (stored) playerConfig = JSON.parse(stored);
      } catch {}
      config = playerConfig
         ?? game.user.getFlag(MODULE_ID, PLAYER_CONFIG_FLAG_KEY)
         ?? foundry.utils.deepClone(falseySettings);
   } else {
      const hiddenUsers = game.settings.get(MODULE_ID, HIDDEN_USERS_KEY);
      const isPlayerUiOverridden = hiddenUsers[game.user.id] !== false;
      if (!isPlayerUiOverridden) return;
      config = game.settings.get(MODULE_ID, SETTINGS_KEY);
   }

   if (config.hideNavigation?.complete) {
      hideElement("navigation");
   } else {
      if (config.hideNavigation?.navToggle) hideElement("navToggle");
      if (config.hideNavigation?.sceneList) hideElement("sceneList");
      if (config.hideNavigation?.bossBar) hideElement("bossBar");
   }

   if (config.hideControls) {
      hideElement("controls");
   }

   if (config.hideSideBar?.complete) {
      hideElement("sidebar");
   } else {
      if (config.hideSideBar?.chatLog) hideElement("chatLog");
      if (config.hideSideBar?.chatInput) hideElement("chatInput");
      if (config.hideSideBar?.combatTracker) hideElement("combatTracker");
      if (config.hideSideBar?.scenesDirectory) hideElement("scenesDirectory");
      if (config.hideSideBar?.actorsDirectory) hideElement("actorsDirectory");
      if (config.hideSideBar?.itemsDirectory) hideElement("itemsDirectory");
      if (config.hideSideBar?.journalEntries) hideElement("journalEntries");
      if (config.hideSideBar?.rollableTables) hideElement("rollableTables");
      if (config.hideSideBar?.cardStacks) hideElement("cardStacks");
      if (config.hideSideBar?.macros) hideElement("macros");
      if (config.hideSideBar?.audioPlaylists) hideElement("audioPlaylists");
      if (config.hideSideBar?.compendiumPacks) hideElement("compendiumPacks");
      if (config.hideSideBar?.gameSettings) hideElement("gameSettings");
      if (config.hideSideBar?.settingsContent?.gameSettings) hideElement("settingsGameSettings");
      if (config.hideSideBar?.settingsContent?.activeModules) hideElement("settingsActiveModules");
      if (config.hideSideBar?.settingsContent?.tours) hideElement("settingsTours");
      if (config.hideSideBar?.settingsContent?.help) hideElement("settingsHelp");
      if (config.hideSideBar?.placeables) hideElement("placeables");

      // dice-so-nice hides its tab via its own setting rather than CSS
      if (game.modules.get("dice-so-nice")?.active) {
         if (config.hideSideBar?.diceSoNice)
            await game.settings.set("dice-so-nice", "hideSidebarTab", true);
      }

      const sidebarSettings = {};
      for (const [key, value] of Object.entries(config.hideSideBar ?? {})) {
         // diceSoNice is handled via the dice-so-nice API, not CSS — exclude it from layout logic
         // settingsContent is an object of sub-element flags, not a tab visibility flag
         if (key === "diceSoNice" || key === "settingsContent") continue;
         sidebarSettings[key] = value;
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

   if (config.hidePlayers) hideElement("players");
   if (config.hideHotbar) hideElement("hotbar");
   if (config.hidePlayerConfig) hideElement("player-config");
   if (config.hideTokenHUD) hideElement("token-hud");

   if (game.modules.get("token-action-hud")?.active) {
      if (config.hideTokenActionHUD) hideElement("token-action-hud");
   }

   if (game.modules.get("custom-hotbar")?.active) {
      if (config.hideCustomHotbar)
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
