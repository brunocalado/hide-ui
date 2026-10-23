import { MODULE_ID, SETTINGS_KEY, HIDDEN_USERS_KEY, GM_CONFIGS_KEY, HIDE_ALL_CAMERAS_KEY, defaultSettings } from "./constants.js";
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
      restricted: true,
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
      default: defaultSettings,
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

   // Maps GM user ID → personal UI config object.
   // World-scoped so the config persists and is readable from any computer.
   game.settings.register(MODULE_ID, GM_CONFIGS_KEY, {
      name: "GM Personal UI Configs",
      scope: "world",
      default: {},
      type: Object,
      config: false,
   });

   // User-scoped and self-service: any user can opt out of seeing the AV dock,
   // independently of the GM's Players UI config and of Player Visibility exemptions.
   game.settings.register(MODULE_ID, HIDE_ALL_CAMERAS_KEY, {
      name: "Hide All Cameras",
      hint: "Hides the whole camera and audio dock on your screen. Its mute and camera buttons go with it: to mute yourself, use push-to-talk or disable your devices in Configure Audio/Video.",
      scope: "user",
      config: true,
      default: false,
      type: Boolean,
      requiresReload: true,
   });
};
