import { MODULE_ID, SETTINGS_KEY, HIDDEN_USERS_KEY, truthySettings } from "./constants.js";
import { HideUISettingsForm } from "./connecting-players-settings-form.js";
import { HideUIPlayerConfigurationForm } from "./player-configuration-form.js";
import { HideUIUserConfigurationForm } from "./user-configuration-form.js";

export const registerSettings = () => {
   game.settings.registerMenu(MODULE_ID, "hide-ui-player-configuration", {
      name: "Personal UI",
      label: "Personal UI",
      hint: "Configure which UI elements to show or hide on your screen.",
      icon: "fas fa-eye-slash",
      type: HideUIPlayerConfigurationForm,
      restricted: false,
   });

   game.settings.registerMenu(MODULE_ID, "hide-ui-connecting-players", {
      name: "Players UI",
      label: "Players UI",
      hint: "Configure which UI elements to show or hide for connecting players.",
      icon: "fas fa-users-slash",
      type: HideUISettingsForm,
      restricted: true,
   });

   game.settings.registerMenu(MODULE_ID, "hide-ui-user-configuration", {
      name: "Player Visibility Settings",
      label: "Player Visibility",
      hint: "Choose which players have the hide settings applied to them. All new players are hidden by default.",
      icon: "fas fa-user-check",
      type: HideUIUserConfigurationForm,
      restricted: true,
   });

   game.settings.register(MODULE_ID, SETTINGS_KEY, {
      name: "Hide UI Settings",
      scope: "world",
      default: truthySettings,
      type: Object,
      config: false,
   });

   // Maps user ID → boolean. true = apply hide settings; false = exempt.
   // Users absent from this map default to hidden on their next login.
   game.settings.register(MODULE_ID, HIDDEN_USERS_KEY, {
      name: "Hidden Users",
      scope: "world",
      default: {},
      type: Object,
      config: false,
   });
};
