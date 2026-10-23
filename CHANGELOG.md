# Unreleased

- [Added] A per-user **Hide All Cameras** setting (off by default) in Configure Settings, which any user can turn on to hide the whole camera and audio dock on their own screen, whatever the GM configured.
- [Fixed] The Token Action HUD option never appeared: the module looked for the old `token-action-hud` id instead of `token-action-hud-core`.

# 0.1.1

- Added a **Notifications** section to both the Players UI and Personal UI forms, absorbing what the separate `hide-notifications` module did. **Hide Notification Toasts** hides the info and warning pop-ups in the corner (the `<li class="notification">` entries inside `#notifications`) while leaving error toasts visible, so an affected player can still see and report failures; an **Also Hide Error Toasts** sub-option hides those too. Like every other option it is CSS-only, reload-based, scoped per-player or to the GM's own screen, and never patches `ui.notifications` — so toasts raised through a direct `ui.notifications.notify(...)` call are covered as well, which the old module missed.

# 0.1.0

- https://github.com/brunocalado/hide-ui/issues/2
- Added a **Scene Levels** option under Navigation in both the Players UI and Personal UI forms. Foundry v14 adds a per-level list to the Scene Navigation bar under the viewed scene whenever that scene has 2+ Levels; this option hides only that list (`#scene-navigation-levels`), leaving every scene name in place so navigation between scenes still works. Handy for hiding level switching from players while the GM keeps it.

# 0.0.9

- Fixed a permission error crashing UI hiding for non-GM players when "Dice So Nice!" was hidden in their config: `hideSidebarTab` is a world-scoped, GM-only setting in Dice So Nice, so a player's client writing it threw and silently aborted every hide-ui rule after it (Players list, Camera/Audio bar, hotbar, Token HUD, etc). The GM now applies that setting from the Players UI form on save, where the write always has permission; the checkbox is labeled as the global, reload-required switch it actually is.

# 0.0.8

https://github.com/brunocalado/hide-ui/issues/1

- Fixed Player Visibility Settings never persisting: `_onSubmit` read a nested `users` key from the flat object returned by `FormDataExtended#object`, so every save wrote an empty map and every toggle reset to "hidden" on reopen.
- Added options to hide individual **Token HUD buttons**, each toggled independently of the whole HUD. Players UI offers **Assign Status Effects**, **Movement Action**, **Target**, **Enter Combat**, and **Open Configuration** (for systems/permissions that expose it to players). Personal UI additionally offers **Hide** and **Lock**, which only ever appear on the GM's own HUD.

# 0.0.7

- Added options to hide individual **Macro Hotbar controls**, each toggled independently of the hotbar itself: **Lock Hotbar**, **Clear Hotbar**, **Main Menu**, and **Mute Volume**. Available in both the Personal UI and Players UI forms, under the Hotbar section.

# 0.0.6

- Redesigned the Players UI and Personal UI config forms: checkboxes are now Apple-style toggle switches, and the Macro Hotbar mode picker is a 3-button segmented control (Off / Hide / Auto-hide) instead of a dropdown.
- Each option group (Navigation, Sidebar, etc.) and standalone option (e.g. Controls Panel) is now a clearly bordered card with its own spacing, so it's obvious which items belong to which group. Sub-options (e.g. Chat Input under Chat Messages) get a colored connector tying them to their parent row.
- Renamed the "Hide Controls Panel" option to "Controls Panel".

# 0.0.5

- Added **Auto-hide** for the Macro Hotbar. In the Personal UI and Players UI forms, the Macro Hotbar now offers three modes: **Off** (always visible), **Hide** (always hidden), and **Auto-hide**. In Auto-hide mode the hotbar stays visible on load, then slides down a few seconds later, leaving a thin strip peeking at the bottom edge; hovering the strip brings it back, and moving the mouse away hides it again.
- Legacy configurations are handled automatically: an existing hotbar setting of "hidden" maps to **Hide** and "visible" maps to **Off**, so no reconfiguration is needed.

# 0.0.4

- Fixed GM Personal UI settings not persisting when logging in from a different computer. Config is now stored as a world setting instead of a user flag.

# 0.0.3

- Added option to hide the Camera / Audio Bar (`#camera-views`). Useful when audio+video is enabled in Foundry settings but only audio is being used.