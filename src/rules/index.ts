// GameRules (C3) genel arayüzü: dealRoles, decide, legalActions, enterNight ve yardımcıları.
export {
  dealRoles,
  defaultSettings,
  ghulCountFor,
  startWarnings,
  validatePlayerCount,
} from './dealRoles.ts';
export { decide } from './decide.ts';
export { isAllowedWhilePaused, legalActions } from './legalActions.ts';
export { enterNight } from './night.ts';
export { checkWinner } from './win.ts';
export type * from './types.ts';
