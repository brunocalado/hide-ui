/**
 * Returns true only for users with the full GAMEMASTER role.
 * Assistant GMs are now configured individually via the player visibility form.
 * @returns {boolean}
 */
export const isFullGM = () => game.user.hasRole("GAMEMASTER");
