// C1 — Canlı bağlantı protokolü: istemci ve sunucu mesajları (zod).
// Sunucu, tarayıcı ve botlar bu tek tanımı kullanır (contract-summary C1 Doğrulama, NFR7.5).
// Tanınmayan alanlar ayrıştırmada atılır (z.object varsayılanı).
import { z } from 'zod';
import {
  CHAT_MAX,
  ChatChannelSchema,
  DeviceTypeSchema,
  NICK_MAX,
  NICK_MIN,
  ROOM_CODE_PATTERN,
} from './domain.ts';
import { ReasonCodeSchema, type ReasonCode } from './reasonCodes.ts';
import type { RecipientView } from './view.ts';

export const PROTOCOL_VERSION = 1;
export const MAX_MESSAGE_BYTES = 16_384; // uygulama sınırı (security-design Mesaj Doğrulama)
export const MAX_FRAME_BYTES = 65_536; // dinleyici sınırı (ws maxPayload)
export const SESSION_TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/; // 32 bayt base64url

// ---------------------------------------------------------------------------
// İstemci → sunucu
// ---------------------------------------------------------------------------

export const HelloSchema = z.object({
  type: z.literal('hello'),
  protocolVersion: z.number().int(),
  appVersion: z.string().min(1).max(64),
  sessionToken: z.string().regex(SESSION_TOKEN_PATTERN).optional(),
  roomCode: z.string().regex(ROOM_CODE_PATTERN).optional(),
  deviceType: DeviceTypeSchema.optional(),
});
export type Hello = z.infer<typeof HelloSchema>;

export const PingSchema = z.object({
  type: z.literal('ping'),
  clientTime: z.number().int().nonnegative(),
});
export type Ping = z.infer<typeof PingSchema>;

export const CommandEnvelopeSchema = z.object({
  type: z.literal('command'),
  commandId: z.uuid(),
  name: z.string().min(1).max(64),
  args: z.unknown().optional(),
});
export type CommandEnvelope = z.infer<typeof CommandEnvelopeSchema>;

export const ClientMessageSchema = z.discriminatedUnion('type', [
  HelloSchema,
  PingSchema,
  CommandEnvelopeSchema,
]);
export type ClientMessage = z.infer<typeof ClientMessageSchema>;

// ---------------------------------------------------------------------------
// Alan biçimleri ve normalleştirme (BR1.3, BR6.4)
// ---------------------------------------------------------------------------

// Kontrol karakterleri (satır sonu dışında) — nick'te hiç, sohbette atılarak.
const CONTROL_CHARS = /[\u0000-\u0009\u000B-\u001F\u007F-\u009F]/g;
const ANY_CONTROL = /[\u0000-\u001F\u007F-\u009F]/;

/** Nick'i boşluklardan arındırıp NFC'ye çevirir; geçersizse null döner. */
export function normalizeNickInput(raw: string): string | null {
  const nick = raw.normalize('NFC').trim();
  const length = [...nick].length;
  if (length < NICK_MIN || length > NICK_MAX) return null;
  if (ANY_CONTROL.test(nick)) return null;
  return nick;
}

/** Oda içi benzersizlik anahtarı: Türkçe küçük harf (BR1.3). */
export function nickKey(nick: string): string {
  return nick.toLocaleLowerCase('tr-TR');
}

export type ChatTextResult =
  { ok: true; text: string } | { ok: false; reasonCode: 'message_empty' | 'message_too_long' };

/** Sohbet metnini düz metne indirger: kontrol karakterleri atılır, 1–300 karakter (BR6.4). */
export function sanitizeChatText(raw: string): ChatTextResult {
  const text = raw.normalize('NFC').replace(CONTROL_CHARS, '').trim();
  if (text.length === 0) return { ok: false, reasonCode: 'message_empty' };
  if ([...text].length > CHAT_MAX) return { ok: false, reasonCode: 'message_too_long' };
  return { ok: true, text };
}

// ---------------------------------------------------------------------------
// Komutlar ve argümanları
// ---------------------------------------------------------------------------

const SeatIdSchema = z.string().min(1).max(16);
const StepVersionArgs = z.object({ stepVersion: z.number().int().min(1) });
const Empty = z.object({});

const RawNick = z.string().max(256);

export const COMMAND_ARG_SCHEMAS = {
  'room.create': z.object({ nick: RawNick }),
  'room.join': z.object({ roomCode: z.string().regex(ROOM_CODE_PATTERN), nick: RawNick }),
  'room.leave': Empty,
  'lobby.startGame': Empty,
  'lobby.kick': z.object({ participantId: z.string().min(1).max(64) }),
  'game.cardSeen': Empty,
  'game.nightSelect': z.object({ targetSeatIds: z.array(SeatIdSchema).max(26) }),
  'game.ghulMark': z.object({ targetSeatId: SeatIdSchema }),
  'game.ghulConfirm': Empty,
  'game.nextStep': StepVersionArgs,
  'game.revealResult': StepVersionArgs,
  'game.moveToVote': StepVersionArgs,
  'game.vote': z.object({ targetSeatId: SeatIdSchema.nullable() }),
  'game.timerExtend': z.object({ seconds: z.number().int().min(10).max(300) }),
  'game.pause': Empty,
  'game.resume': Empty,
  'game.newGame': Empty,
  'chat.send': z.object({ channel: ChatChannelSchema, text: z.string().max(4096) }),
} as const;

export type ClientCommandName = keyof typeof COMMAND_ARG_SCHEMAS;
export const CLIENT_COMMAND_NAMES = Object.keys(COMMAND_ARG_SCHEMAS) as ClientCommandName[];

export type CommandArgs<N extends ClientCommandName> = z.infer<(typeof COMMAND_ARG_SCHEMAS)[N]>;

export type ParsedCommand = {
  [N in ClientCommandName]: { name: N; args: CommandArgs<N> };
}[ClientCommandName];

export function isClientCommandName(name: string): name is ClientCommandName {
  return Object.prototype.hasOwnProperty.call(COMMAND_ARG_SCHEMAS, name);
}

/** Bozuk alanda hangi neden kodunun döneceği (security-design Mesaj Doğrulama tablosu). */
function argsReasonCode(name: ClientCommandName): ReasonCode {
  if (name === 'room.create') return 'nick_invalid';
  if (name === 'room.join') return 'room_not_found';
  if (name === 'chat.send') return 'message_too_long';
  return 'invalid_target';
}

export type ParseCommandResult =
  { ok: true; command: ParsedCommand } | { ok: false; reasonCode: ReasonCode };

/**
 * Komut adını ve argümanlarını doğrular. İstemci listesinde olmayan her ad
 * (`system.*` dahil) `not_your_turn` alır (BR10.6). Nick ve sohbet metni burada
 * normalleştirilir; sonraki katmanlar yeniden doğrulamaz.
 */
export function parseCommand(name: string, rawArgs: unknown): ParseCommandResult {
  if (!isClientCommandName(name)) return { ok: false, reasonCode: 'not_your_turn' };
  const parsed = COMMAND_ARG_SCHEMAS[name].safeParse(rawArgs ?? {});
  if (!parsed.success) {
    if (name === 'room.join' && hasValidRoomCode(rawArgs)) {
      return { ok: false, reasonCode: 'nick_invalid' };
    }
    return { ok: false, reasonCode: argsReasonCode(name) };
  }
  const args = parsed.data as Record<string, unknown>;
  if (name === 'room.create' || name === 'room.join') {
    const nick = normalizeNickInput(String(args.nick));
    if (nick === null) return { ok: false, reasonCode: 'nick_invalid' };
    args.nick = nick;
  }
  if (name === 'chat.send') {
    const text = sanitizeChatText(String(args.text));
    if (!text.ok) return { ok: false, reasonCode: text.reasonCode };
    args.text = text.text;
  }
  return { ok: true, command: { name, args } as ParsedCommand };
}

function hasValidRoomCode(raw: unknown): boolean {
  if (typeof raw !== 'object' || raw === null) return false;
  const code = (raw as { roomCode?: unknown }).roomCode;
  return typeof code === 'string' && ROOM_CODE_PATTERN.test(code);
}

// ---------------------------------------------------------------------------
// Sunucu → istemci
// ---------------------------------------------------------------------------

export type AckStatus = 'accepted' | 'rejected' | 'duplicate';

export interface WelcomeMessage {
  type: 'welcome';
  serverTime: number;
  protocolVersion: number;
  sessionToken?: string;
}
export interface AckMessage {
  type: 'ack';
  commandId: string;
  status: AckStatus;
  reasonCode?: ReasonCode;
}
export interface ViewMessage {
  type: 'view';
  viewVersion: number;
  serverTime: number;
  view: RecipientView;
}
export interface PongMessage {
  type: 'pong';
  clientTime: number;
  serverTime: number;
}
export interface ReloadMessage {
  type: 'reload';
  reason: 'version';
}
export interface SupersededMessage {
  type: 'superseded';
}
export interface ClosedMessage {
  type: 'closed';
  reasonCode: ReasonCode;
}

export type ServerMessage =
  | WelcomeMessage
  | AckMessage
  | ViewMessage
  | PongMessage
  | ReloadMessage
  | SupersededMessage
  | ClosedMessage;

// Botlar ve tarayıcı gelen mesajı bu şemayla denetler; görünümün ayrıntısı view.ts'tedir.
export const ServerMessageSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('welcome'),
    serverTime: z.number(),
    protocolVersion: z.number(),
    sessionToken: z.string().optional(),
  }),
  z.object({
    type: z.literal('ack'),
    commandId: z.string(),
    status: z.enum(['accepted', 'rejected', 'duplicate']),
    reasonCode: ReasonCodeSchema.optional(),
  }),
  z.object({
    type: z.literal('view'),
    viewVersion: z.number(),
    serverTime: z.number(),
    view: z.record(z.string(), z.unknown()),
  }),
  z.object({ type: z.literal('pong'), clientTime: z.number(), serverTime: z.number() }),
  z.object({ type: z.literal('reload'), reason: z.literal('version') }),
  z.object({ type: z.literal('superseded') }),
  z.object({ type: z.literal('closed'), reasonCode: ReasonCodeSchema }),
]);
