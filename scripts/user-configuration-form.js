import { MODULE_ID, HIDDEN_USERS_KEY } from "./constants.js";

const { HandlebarsApplicationMixin, ApplicationV2 } = foundry.applications.api;

/**
 * GM-only form listing all non-GM users. The GM can toggle per-user whether the
 * world hide settings are applied to them. Absent users default to hidden on first login.
 */
export class HideUIUserConfigurationForm extends HandlebarsApplicationMixin(ApplicationV2) {
   static DEFAULT_OPTIONS = {
      id: "hide-ui-user-configuration-form",
      classes: ["hide-ui"],
      window: { title: "Player Visibility Settings" },
      position: { width: 460 },
   };

   /** @type {AbortController|null} Cleans up the submit listener on each re-render. */
   _submitController = null;

   static PARTS = {
      form: {
         template: `modules/${MODULE_ID}/templates/user-configuration-form.hbs`,
      },
   };

   /**
    * Builds the list of non-GM users with their current hide status.
    * Users absent from the saved setting default to hidden (true).
    * @param {ApplicationRenderOptions} options
    * @returns {Promise<Object>}
    */
   async _prepareContext(options) {
      const hiddenUsers = game.settings.get(MODULE_ID, HIDDEN_USERS_KEY);
      const roleLabels = ["None", "Player", "Trusted", "Assistant"];

      const users = game.users
         .filter(u => !u.hasRole("GAMEMASTER"))
         .map(u => ({
            id: u.id,
            name: u.name,
            avatar: u.avatar || "icons/svg/mystery-man.svg",
            role: roleLabels[u.role] ?? "Player",
            isHidden: hiddenUsers[u.id] !== false,
         }))
         .sort((a, b) => a.name.localeCompare(b.name));

      return { users };
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
         await HideUIUserConfigurationForm._onSubmit.call(this, event, form, fd);
         this.close();
      }, { signal: this._submitController.signal });
   }

   /**
    * Saves the per-user hide flags to the world setting on submit.
    * @param {Event} event
    * @param {HTMLFormElement} _form
    * @param {FormDataExtended} formData
    * @returns {Promise<void>}
    */
   static async _onSubmit(event, _form, formData) {
      const hiddenUsers = formData.object.users ?? {};
      await game.settings.set(MODULE_ID, HIDDEN_USERS_KEY, hiddenUsers);
   }
}
