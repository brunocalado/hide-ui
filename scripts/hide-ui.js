import { MODULE_ID, SETTINGS_KEY, HIDDEN_USERS_KEY, SOCKET_EVENT } from "./constants.js";
import { registerSettings } from "./settings.js";
import { isFullGM } from "./helpers.js";

Hooks.on("init", () => {
   registerSettings();
});

Hooks.on("ready", async () => {
   if (!isFullGM()) {
      game.socket.on(SOCKET_EVENT, async (payload) => {
         if (payload?.type !== "settingsUpdated") return;
         const reload = await foundry.applications.api.DialogV2.confirm({
            window: { title: "UI Settings Updated" },
            content: "<p>The GM has updated the UI settings. Reload now to apply the changes?</p>",
         });
         if (reload) window.location.reload();
      });
   }

   const hiddenUsers = game.settings.get(MODULE_ID, HIDDEN_USERS_KEY);

   // Full GMs are never affected. All other users default to hidden if not explicitly exempted.
   const isPlayerUiOverridden = !isFullGM() && (hiddenUsers[game.user.id] !== false);

   if (!isPlayerUiOverridden) return;

   const settings = game.settings.get(MODULE_ID, SETTINGS_KEY);

   if (settings.hideNavigation?.complete) {
      hideElement("navigation");
   } else {
      if (settings.hideNavigation?.navToggle) hideElement("navToggle");
      if (settings.hideNavigation?.sceneList) hideElement("sceneList");
      if (settings.hideNavigation?.bossBar) hideElement("bossBar");
   }

   if (settings.hideControls) {
      hideElement("controls");
   }

   if (settings.hideSideBar?.complete) {
      hideElement("sidebar");
   } else {
      if (settings.hideSideBar?.chatLog) hideElement("chatLog");
      if (settings.hideSideBar?.chatInput) hideElement("chatInput");
      if (settings.hideSideBar?.combatTracker) hideElement("combatTracker");
      if (settings.hideSideBar?.scenesDirectory) hideElement("scenesDirectory");
      if (settings.hideSideBar?.actorsDirectory) hideElement("actorsDirectory");
      if (settings.hideSideBar?.itemsDirectory) hideElement("itemsDirectory");
      if (settings.hideSideBar?.journalEntries) hideElement("journalEntries");
      if (settings.hideSideBar?.rollableTables) hideElement("rollableTables");
      if (settings.hideSideBar?.cardStacks) hideElement("cardStacks");
      if (settings.hideSideBar?.macros) hideElement("macros");
      if (settings.hideSideBar?.audioPlaylists) hideElement("audioPlaylists");
      if (settings.hideSideBar?.compendiumPacks) hideElement("compendiumPacks");
      if (settings.hideSideBar?.gameSettings) hideElement("gameSettings");
      if (settings.hideSideBar?.placeables) hideElement("placeables");

      // dice-so-nice hides its tab via its own setting rather than CSS
      if (game.modules.get("dice-so-nice")?.active) {
         if (settings.hideSideBar?.diceSoNice)
            await game.settings.set("dice-so-nice", "hideSidebarTab", true);
      }

      const sidebarSettings = {};
      for (const [key, value] of Object.entries(settings.hideSideBar ?? {})) {
         // diceSoNice is handled via the dice-so-nice API, not CSS — exclude it from layout logic
         if (key === "diceSoNice") continue;
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

   if (settings.hidePlayers) hideElement("players");
   if (settings.hideHotbar) hideElement("hotbar");
   if (settings.hidePlayerConfig) hideElement("player-config");
   if (settings.hideTokenHUD) hideElement("token-hud");

   if (game.modules.get("token-action-hud")?.active) {
      if (settings.hideTokenActionHUD) hideElement("token-action-hud");
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
