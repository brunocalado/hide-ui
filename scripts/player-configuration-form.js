import { MODULE_ID, PLAYER_CONFIG_STORAGE_KEY, SETTINGS_KEY, HIDDEN_USERS_KEY, PLAYER_CONFIG_FLAG_KEY, truthySettings, falseySettings } from "./constants.js";
import { isFullGM } from "./helpers.js";

const { HandlebarsApplicationMixin, ApplicationV2 } = foundry.applications.api;

/**
 * GM-only personal UI form. Lets the GM configure which UI elements are hidden on their own screen.
 * Opened via the module's settings menu entry (restricted: true).
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
    * Builds context for the personal UI form.
    * The GM has full control over all options — no world-settings restrictions apply.
    * @param {ApplicationRenderOptions} options
    * @returns {Promise<Object>}
    */
   async _prepareContext(options) {
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

      // GM always has full control — all canControl flags are true.
      const canControl = {
         hideNavigation: { complete: true, navToggle: true, sceneList: true, bossBar: true },
         hideControls: true,
         hideSideBar: {
            chatLog: true,
            chatInput: true,
            combatTracker: true,
            scenesDirectory: true,
            actorsDirectory: true,
            itemsDirectory: true,
            journalEntries: true,
            rollableTables: true,
            cardStacks: true,
            macros: true,
            audioPlaylists: true,
            compendiumPacks: true,
            gameSettings: true,
            placeables: true,
            diceSoNice: game.modules.get("dice-so-nice")?.active ?? false,
         },
         hidePlayers: true,
         hideHotbar: true,
         hidePlayerConfig: true,
         hideTokenHUD: true,
         hideTokenActionHUD: true,
         hideCustomHotbar: true,
      };

      return {
         playerConfig,
         canControl,
         showNavigationSection: true,
         showSidebarSection: true,
         showPlayersSection: true,
         showHotbarSection: true,
         showHudSection: true,
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
    * Toggles all visible checkboxes.
    * @param {Event} event
    * @param {HTMLElement} _target
    * @returns {Promise<void>}
    */
   static async _onToggleAll(event, _target) {
      const form = this.element.querySelector("form");
      const anyChecked = [...form.querySelectorAll('input[type="checkbox"]')].some(cb => cb.checked);
      this._formState = foundry.utils.deepClone(anyChecked ? falseySettings : truthySettings);
      this.render();
   }

   /**
    * Saves the personal UI configuration to the GM's user flag on submit.
    * localStorage is written first so the ready hook can read it immediately after
    * the page reload that setFlag triggers in V14.
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
      localStorage.setItem(PLAYER_CONFIG_STORAGE_KEY, JSON.stringify(data));
      await game.user.setFlag(MODULE_ID, PLAYER_CONFIG_FLAG_KEY, data);
   }
}
