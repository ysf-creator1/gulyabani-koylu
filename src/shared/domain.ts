// Sunucu, tarayıcı ve botların ortak kullandığı alan adları (entities.md, C5 adlarıyla birebir).
import { z } from 'zod';

export const PHASES = [
  'first_night',
  'night',
  'morning',
  'day',
  'voting',
  'last_words',
  'confirm_vote',
  'ended',
] as const;
export const PhaseSchema = z.enum(PHASES);
export type Phase = z.infer<typeof PhaseSchema>;

export const ROLE_IDS = ['ghul', 'villager'] as const;
export const RoleIdSchema = z.enum(ROLE_IDS);
export type RoleId = z.infer<typeof RoleIdSchema>;

export const SIDES = ['ghuls', 'villagers'] as const;
export const SideSchema = z.enum(SIDES);
export type Side = z.infer<typeof SideSchema>;

export const STEP_CURSORS = ['card_reveal', 'ghul_meet', 'ghul_kill'] as const;
export const StepCursorSchema = z.enum(STEP_CURSORS);
export type StepCursor = z.infer<typeof StepCursorSchema>;

export const STEP_STATUSES = ['waiting', 'done', 'timed_out', 'player_disconnected'] as const;
export const StepStatusSchema = z.enum(STEP_STATUSES);
export type StepStatus = z.infer<typeof StepStatusSchema>;

export const VOTE_ROUNDS = ['initial', 'revote', 'confirm'] as const;
export const VoteRoundSchema = z.enum(VOTE_ROUNDS);
export type VoteRound = z.infer<typeof VoteRoundSchema>;

export const CHAT_CHANNELS = ['day', 'ghul'] as const;
export const ChatChannelSchema = z.enum(CHAT_CHANNELS);
export type ChatChannel = z.infer<typeof ChatChannelSchema>;

export const PAUSE_REASONS = ['moderator', 'moderator_lost'] as const;
export const PauseReasonSchema = z.enum(PAUSE_REASONS);
export type PauseReason = z.infer<typeof PauseReasonSchema>;

export const DEVICE_TYPES = ['phone', 'tablet', 'desktop'] as const;
export const DeviceTypeSchema = z.enum(DEVICE_TYPES);
export type DeviceType = z.infer<typeof DeviceTypeSchema>;

export const ROOM_STATUSES = ['lobby', 'in_game', 'ended'] as const;
export const RoomStatusSchema = z.enum(ROOM_STATUSES);
export type RoomStatus = z.infer<typeof RoomStatusSchema>;

export const ACTION_KINDS = ['see_card', 'ghul_meet', 'ghul_mark', 'vote'] as const;
export const ActionKindSchema = z.enum(ACTION_KINDS);
export type ActionKind = z.infer<typeof ActionKindSchema>;

// Sabit sınırlar (BR1.3, BR2.1, BR6.4)
export const NICK_MIN = 2;
export const NICK_MAX = 16;
export const MIN_PLAYERS = 3;
export const MAX_PLAYERS = 26;
export const RECOMMENDED_PLAYERS = 6;
export const CHAT_MAX = 300;
export const ROOM_CODE_PATTERN = /^[0-9]{6}$/;
