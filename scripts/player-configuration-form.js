import { MODULE_ID, PLAYER_CONFIG_STORAGE_KEY, SETTINGS_KEY, HIDDEN_USERS_KEY, PLAYER_CONFIG_FLAG_KEY, truthySettings, falseySettings } from "./constants.js";
import { isFullGM } from "./helpers.js";

const { HandlebarsApplicationMixin, ApplicationV2 } = foundry.applications.api;

/**
 * Per-player settings form for configuring personal UI element visibility.
 * Options already force-hidden by GM world settings are omitted from the form.
 * Opened via the module's settings menu entry (restricted: false).
 */
export class HideUIPlayerConfigurationForm extends HandlebarsApplicationMixin(ApplicationV2) {
   static DEFAULT_OPTIONS = {
      id: "hide-ui-player-configuration-form",
      classes: ["hide-ui"],
      window: { title: "Personal UI" },
      position: { width: 520, height: 640 },
      actions: {
         toggleAll: HideUIPlayerConfigurationForm._onToggleAll,
      },
   };

   static PARTS = {
      form: {
         template: `modules/${MODULE_ID}/templates/player-configuration-form.hbs`,
      },
   };

   /** @type {Object|null} Unsaved state held between action-triggered re-renders. */
   _formState = null;

   /** @type {AbortController|null} Cleans up the submit listener on each re-render. */
   _submitController = null;

   /**
    * Determines whether the current player's UI is being overridden by GM world settings.
    * Full GMs are never overridden. All other users default to hidden if not explicitly exempted.
    * @returns {boolean}
    */
   _getPlayerUiOverridden() {
      if (isFullGM()) return false;
      const hiddenUsers = game.settings.get(MODULE_ID, HIDDEN_USERS_KEY);
      return hiddenUsers[game.user.id] !== false;
   }

   /**
    * Builds context for the player configuration form.
    * Pre-computes `canControl` flags so the template avoids complex boolean logic.
    * An option is controllable when the GM has not already force-hidden it via world settings.
    * @param {ApplicationRenderOptions} options
    * @returns {Promise<Object>}
    */
   async _prepareContext(options) {
      const ws = game.settings.get(MODULE_ID, SETTINGS_KEY);

      // Mirror the same read priority used in the ready hook: localStorage first,
      // then the server flag, so the form reflects the correct state even after a reload.
      let savedPlayerConfig = null;
      try {
         const stored = localStorage.getItem(PLAYER_CONFIG_STORAGE_KEY);
         if (stored) savedPlayerConfig = JSON.parse(stored);
      } catch {}
      savedPlayerConfig ??= game.user.getFlag(MODULE_ID, PLAYER_CONFIG_FLAG_KEY);

      const playerConfig = this._formState
         ?? savedPlayerConfig
         ?? foundry.utils.deepClone(falseySettings);
      const ov = this._getPlayerUiOverridden();

      const canControl = {
         hideNavigation: {
            complete: !(ov && ws.hideNavigation.complete),
            navToggle: !(ov && (ws.hideNavigation.complete || ws.hideNavigation.navToggle)),
            sceneList: !(ov && (ws.hideNavigation.complete || ws.hideNavigation.sceneList)),
            bossBar: !(ov && (ws.hideNavigation.complete || ws.hideNavigation.bossBar)),
         },
         hideControls: !(ov && ws.hideControls),
         hideSideBar: {
            chatLog: !(ov && (ws.hideSideBar.complete || ws.hideSideBar.chatLog)),
            chatInput: !(ov && (ws.hideSideBar.complete || ws.hideSideBar.chatLog || ws.hideSideBar.chatInput)),
            combatTracker: !(ov && (ws.hideSideBar.complete || ws.hideSideBar.combatTracker)),
            scenesDirectory: !(ov && (ws.hideSideBar.complete || ws.hideSideBar.scenesDirectory)),
            actorsDirectory: !(ov && (ws.hideSideBar.complete || ws.hideSideBar.actorsDirectory)),
            itemsDirectory: !(ov && (ws.hideSideBar.complete || ws.hideSideBar.itemsDirectory)),
            journalEntries: !(ov && (ws.hideSideBar.complete || ws.hideSideBar.journalEntries)),
            rollableTables: !(ov && (ws.hideSideBar.complete || ws.hideSideBar.rollableTables)),
            cardStacks: !(ov && (ws.hideSideBar.complete || ws.hideSideBar.cardStacks)),
            macros: !(ov && (ws.hideSideBar.complete || ws.hideSideBar.macros)),
            audioPlaylists: !(ov && (ws.hideSideBar.complete || ws.hideSideBar.audioPlaylists)),
            compendiumPacks: !(ov && (ws.hideSideBar.complete || ws.hideSideBar.compendiumPacks)),
            gameSettings: !(ov && (ws.hideSideBar.complete || ws.hideSideBar.gameSettings)),
            placeables: !(ov && (ws.hideSideBar.complete || ws.hideSideBar.placeables)),
         },
         hidePlayers: !(ov && ws.hidePlayers),
         hideHotbar: !(ov && ws.hideHotbar),
         hidePlayerConfig: !(ov && ws.hidePlayerConfig),
         hideTokenHUD: !(ov && ws.hideTokenHUD),
         hideTokenActionHUD: !(ov && ws.hideTokenActionHUD),
         hideCustomHotbar: !(ov && ws.hideCustomHotbar),
      };

      // Pre-compute section visibility to keep the template free of compound logic
      const showNavigationSection = Object.values(canControl.hideNavigation).some(v => v);
      const showSidebarSection = Object.values(canControl.hideSideBar).some(v => v);
      const showPlayersSection = canControl.hidePlayers || canControl.hidePlayerConfig;
      const showHotbarSection = canControl.hideHotbar || canControl.hideCustomHotbar;
      const showHudSection = canControl.hideTokenHUD || canControl.hideTokenActionHUD;

      return {
         playerConfig,
         canControl,
         showNavigationSection,
         showSidebarSection,
         showPlayersSection,
         showHotbarSection,
         showHudSection,
         renderTokenActionHudOption: game.modules.get("token-action-hud")?.active ?? false,
         renderCustomHotbarOption: game.modules.get("custom-hotbar")?.active ?? false,
         renderBossBarOption: game.modules.get("bossbar")?.active ?? false,
      };
   }

   /**
    * Attaches the form submit listener on every render using an AbortController so
    * re-renders (e.g. after toggleAll) never accumulate duplicate listeners.
    * The DEFAULT_OPTIONS form.handler mechanism is deliberately not used because in
    * some V14 AppV2 builds the automatic connection is unreliable, causing native browser
    * form submission (page reload) instead of calling the handler.
    * @param {ApplicationRenderContext} context
    * @param {ApplicationRenderOptions} options
    */
   _onRender(context, options) {
      this._submitController?.abort();
      this._submitController = new AbortController();
      const form = this.element.querySelector("form");
      if (!form) return;
      form.addEventListener("submit", async (event) => {
         event.preventDefault();
         const fd = new foundry.applications.ux.FormDataExtended(form);
         await HideUIPlayerConfigurationForm._onSubmit.call(this, event, form, fd);
         this.close();
      }, { signal: this._submitController.signal });
   }

   /**
    * Toggles all visible checkboxes with safety guards to prevent locking players out of all sidebar access.
    * @param {Event} event
    * @param {HTMLElement} _target
    * @returns {Promise<void>}
    */
   static async _onToggleAll(event, _target) {
      const form = this.element.querySelector("form");
      const anyChecked = [...form.querySelectorAll('input[type="checkbox"]')].some(cb => cb.checked);
      if (anyChecked) {
         this._formState = foundry.utils.deepClone(falseySettings);
      } else {
         const playerTruthy = foundry.utils.deepClone(truthySettings);
         // Prevent locking the player out of all sidebar access and game settings
         playerTruthy.hideSideBar.complete = false;
         playerTruthy.hideSideBar.gameSettings = false;
         this._formState = playerTruthy;
      }
      this.render();
   }

   /**
    * Saves the personal UI configuration to the user's flag on submit.
    * Merges into the existing flag so options hidden from the form (GM-overridden) are preserved.
    * @param {Event} event
    * @param {HTMLFormElement} _form
    * @param {FormDataExtended} formData
    * @returns {Promise<void>}
    */
   static async _onSubmit(event, _form, formData) {
      const current = game.user.getFlag(MODULE_ID, PLAYER_CONFIG_FLAG_KEY)
         ?? foundry.utils.deepClone(falseySettings);
      const data = foundry.utils.mergeObject(current, formData.object, {
         insertKeys: true,
         insertValues: true,
      });
      // Write to localStorage first: if setFlag triggers a page reload in V14,
      // the ready hook reads from localStorage and the settings are not lost.
      localStorage.setItem(PLAYER_CONFIG_STORAGE_KEY, JSON.stringify(data));
      await game.user.setFlag(MODULE_ID, PLAYER_CONFIG_FLAG_KEY, data);
   }
}
