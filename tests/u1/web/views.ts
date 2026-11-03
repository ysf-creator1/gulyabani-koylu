// Ekran testleri için C5 biçiminde örnek görünümler (tür denetimli).
import type { RecipientView, ViewGame, ViewModerator } from '../../../src/shared/view.ts';

export const NOW = 1_000_000;

export function lobbyView(overrides: Partial<RecipientView> = {}): RecipientView {
  return {
    me: { participantId: 'p1', nick: 'Bot1', kind: 'player' },
    room: {
      roomCode: '123456',
      link: 'https://game.test/oda/123456',
      status: 'lobby',
      moderatorNick: 'Moderator',
      participants: [
        { participantId: 'pm', nick: 'Moderator' },
        { participantId: 'p1', nick: 'Bot1' },
        { participantId: 'p2', nick: 'Bot2' },
      ],
      openRoleIds: ['ghul', 'villager'],
      expiresAt: NOW + 86_400_000,
    },
    chat: { channels: [{ channel: 'day', canWrite: false, messages: [] }] },
    ...overrides,
  };
}

const seats = [
  { seatId: 's1', nick: 'Bot1', alive: true },
  { seatId: 's2', nick: 'Bot2', alive: true },
  { seatId: 's3', nick: 'Bot3', alive: true },
  { seatId: 's4', nick: 'Bot4', alive: true },
];

export function gameView(
  game: Partial<ViewGame>,
  me: Partial<RecipientView['me']> = {},
  extra: Partial<RecipientView> = {},
): RecipientView {
  return {
    ...lobbyView(),
    me: {
      participantId: 'p1',
      nick: 'Bot1',
      kind: 'player',
      seatId: 's1',
      roleId: 'villager',
      alive: true,
      ...me,
    },
    room: { ...lobbyView().room, status: 'in_game' },
    game: {
      phase: 'first_night',
      nightNumber: 1,
      dayNumber: 0,
      paused: false,
      seats: seats.map((s) => ({ ...s })),
      ...game,
    },
    ...extra,
  };
}

export function moderatorBlock(overrides: Partial<ViewModerator> = {}): ViewModerator {
  return {
    stepVersion: 3,
    announcementTextKey: 'announce.card_reveal',
    expectedAction: 'expected.card_reveal',
    allSeats: [
      { seatId: 's1', nick: 'Bot1', roleId: 'ghul', alive: true, connected: true, cardSeen: true },
      {
        seatId: 's2',
        nick: 'Bot2',
        roleId: 'villager',
        alive: true,
        connected: false,
        cardSeen: false,
      },
      {
        seatId: 's3',
        nick: 'Bot3',
        roleId: 'villager',
        alive: true,
        connected: true,
        cardSeen: false,
      },
      {
        seatId: 's4',
        nick: 'Bot4',
        roleId: 'villager',
        alive: false,
        connected: true,
        cardSeen: true,
      },
    ],
    notices: [],
    ...overrides,
  };
}
