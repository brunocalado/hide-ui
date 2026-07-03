# 0.0.5

- Added **Auto-hide** for the Macro Hotbar. In the Personal UI and Players UI forms, the Macro Hotbar now offers three modes: **Off** (always visible), **Hide** (always hidden), and **Auto-hide**. In Auto-hide mode the hotbar stays visible on load, then slides down a few seconds later, leaving a thin strip peeking at the bottom edge; hovering the strip brings it back, and moving the mouse away hides it again.
- Legacy configurations are handled automatically: an existing hotbar setting of "hidden" maps to **Hide** and "visible" maps to **Off**, so no reconfiguration is needed.

# 0.0.4

- Fixed GM Personal UI settings not persisting when logging in from a different computer. Config is now stored as a world setting instead of a user flag.

# 0.0.3

- Added option to hide the Camera / Audio Bar (`#camera-views`). Useful when audio+video is enabled in Foundry settings but only audio is being used.