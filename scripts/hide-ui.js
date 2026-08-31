import { MODULE_ID, SETTINGS_KEY, HIDDEN_USERS_KEY, GM_CONFIGS_KEY, PLAYER_CONFIG_STORAGE_KEY, falseySettings, truthySettings, SOCKET_EVENT, AUTOHIDE_DELAY_MS } from "./constants.js";
import { registerSettings } from "./settings.js";
import { isFullGM, normalizeMode } from "./helpers.js";

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
         await game.settings.set(MODULE_ID, GM_CONFIGS_KEY, {});
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
         ?? game.settings.get(MODULE_ID, GM_CONFIGS_KEY)[game.user.id]
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
      if (config.hideNavigation?.sceneLevels) hideElement("sceneLevels");
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
      if (config.hideSideBar?.chatMenuBar) hideElement("chatMenuBar");
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

      // dice-so-nice hides its tab via its own setting rather than CSS.
      // That setting is world-scoped and GM-only in dice-so-nice, so only the GM
      // can write it here — a non-GM client would throw a permission error and
      // silently abort the rest of this hook. The player-override value of this
      // checkbox is instead applied by the GM in HideUISettingsForm._onSubmit.
      if (isFullGM() && game.modules.get("dice-so-nice")?.active && config.hideSideBar?.diceSoNice) {
         try {
            await game.settings.set("dice-so-nice", "hideSidebarTab", true);
         } catch (err) {
            console.error(`${MODULE_ID} | Failed to update dice-so-nice's hideSidebarTab setting`, err);
         }
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
   if (config.hideCameraViews) hideElement("camera-views");

   // The Macro Hotbar is the only element with a tri-state mode
   // ("off" | "hide" | "autohide"). normalizeMode() coerces legacy boolean configs.
   const hotbarMode = normalizeMode(config.hideHotbar);
   if (hotbarMode === "hide") hideElement("hotbar");
   else if (hotbarMode === "autohide") autoHideElement("hotbar");

   // Individual hotbar control buttons, hidden independently of the hotbar itself.
   if (config.hideHotbarControls?.lock) hideElement("hotbarLock");
   if (config.hideHotbarControls?.clear) hideElement("hotbarClear");
   if (config.hideHotbarControls?.menu) hideElement("hotbarMenu");
   if (config.hideHotbarControls?.mute) hideElement("hotbarMute");

   if (config.hidePlayerConfig) hideElement("player-config");
   if (config.hideTokenHUD) hideElement("token-hud");

   // Individual Token HUD buttons, hidden independently of the HUD itself.
   if (config.hideTokenHUDControls?.statusEffects) hideElement("tokenHudStatusEffects");
   if (config.hideTokenHUDControls?.movementAction) hideElement("tokenHudMovementAction");
   if (config.hideTokenHUDControls?.target) hideElement("tokenHudTarget");
   if (config.hideTokenHUDControls?.combat) hideElement("tokenHudCombat");
   if (config.hideTokenHUDControls?.hide) hideElement("tokenHudHide");
   if (config.hideTokenHUDControls?.lock) hideElement("tokenHudLock");
   if (config.hideTokenHUDControls?.config) hideElement("tokenHudConfig");

   if (game.modules.get("token-action-hud")?.active) {
      if (config.hideTokenActionHUD) hideElement("token-action-hud");
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
 * Enables auto-hide for the Macro Hotbar: the reveal-on-hover behavior is pure CSS
 * (body class + `:hover`, see styles/auto-hide.css), so it survives Foundry re-renders
 * without re-binding listeners. This only arms the collapsed "peek" state after a delay;
 * the hotbar stays visible until then.
 * @param {string} id - The element key ("hotbar").
 * @returns {void}
 */
const autoHideElement = (id) => {
   document.body.classList.add(`hide-ui-autohide-${id}`);
   window.setTimeout(() => document.body.classList.add(`hide-ui-peek-${id}`), AUTOHIDE_DELAY_MS);
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
