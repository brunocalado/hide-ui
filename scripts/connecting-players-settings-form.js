import { MODULE_ID, SETTINGS_KEY, truthySettings, falseySettings, SOCKET_EVENT } from "./constants.js";

const { HandlebarsApplicationMixin, ApplicationV2 } = foundry.applications.api;

/**
 * GM-only settings form for configuring which UI elements are hidden for connecting players.
 * Opened via the module's settings menu entry (restricted: true).
 */
export class HideUISettingsForm extends HandlebarsApplicationMixin(ApplicationV2) {
   static DEFAULT_OPTIONS = {
      id: "hide-ui-settings-form",
      classes: ["hide-ui"],
      window: { title: "Players UI" },
      position: { width: 520, height: 640 },
      actions: {
         toggleAll: HideUISettingsForm._onToggleAll,
      },
   };

   static PARTS = {
      form: {
         template: `modules/${MODULE_ID}/templates/settings-form.hbs`,
      },
   };

   /** @type {Object|null} Unsaved state held between action-triggered re-renders. */
   _formState = null;

   /** @type {AbortController|null} Cleans up the submit listener on each re-render. */
   _submitController = null;

   /**
    * Builds context for the settings form template.
    * Uses _formState when re-rendering after toggle actions, otherwise reads world settings.
    * @param {ApplicationRenderOptions} options
    * @returns {Promise<Object>}
    */
   async _prepareContext(options) {
      const settings = this._formState ?? game.settings.get(MODULE_ID, SETTINGS_KEY);
      return {
         settings,
         renderTokenActionHudOption: game.modules.get("token-action-hud")?.active ?? false,
         renderCustomHotbarOption: game.modules.get("custom-hotbar")?.active ?? false,
         renderBossBarOption: game.modules.get("bossbar")?.active ?? false,
         renderDiceSoNiceOption: game.modules.get("dice-so-nice")?.active ?? false,
      };
   }

   /**
    * Attaches the form submit listener on every render.
    * See HideUIPlayerConfigurationForm._onRender for the rationale.
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
         await HideUISettingsForm._onSubmit.call(this, event, form, fd);
         this.close();
      }, { signal: this._submitController.signal });
   }

   /**
    * Toggles all checkboxes: unchecks all if any are checked, checks all otherwise.
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
    * Persists form data to world settings on submit.
    * Merges into existing settings so keys absent from the form (hidden by conditionals) are preserved.
    * @param {Event} event
    * @param {HTMLFormElement} _form
    * @param {FormDataExtended} formData
    * @returns {Promise<void>}
    */
   static async _onSubmit(event, _form, formData) {
      const current = game.settings.get(MODULE_ID, SETTINGS_KEY);
      const data = foundry.utils.mergeObject(current, formData.object, {
         insertKeys: true,
         insertValues: true,
      });
      await game.settings.set(MODULE_ID, SETTINGS_KEY, data);
      game.socket.emit(SOCKET_EVENT, { type: "settingsUpdated" });
   }
}
