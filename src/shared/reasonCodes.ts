// C1 ReasonCode: dile bağlı olmayan red ve kapanış nedenleri.
// Ekranda `error.<kod>` anahtarıyla content/tr.json'dan Türkçe gösterilir (NFR11).
// Parçalar yalnızca kod ekler; var olan kodun anlamı değişmez (contract-summary C1).
import { z } from 'zod';

export const REASON_CODES = [
  // U1 çekirdeği (C1)
  'room_not_found',
  'room_full',
  'nick_invalid',
  'nick_taken',
  'too_few_players',
  'not_moderator',
  'not_your_turn',
  'invalid_target',
  'phase_closed',
  'chat_not_allowed',
  'message_empty',
  'message_too_long',
  'session_invalid',
  'kicked',
  'unsupported_protocol',
  'internal_error',
  // U1 eklemeleri (functional-spec "Sözleşmeye eklemeler", security-design)
  'step_waiting',
  'game_paused',
  'server_busy',
  // C1'de U8 altında; Teslim Planlaması B1 basit hız sınırını U1'e aldı (BR10.3)
  'rate_limited',
  // Oyuncu odadan kendi isteğiyle çıktı (sahip geri bildirimi 2026-11-04); bağlantı kapanış nedeni
  'left',
] as const;

export const ReasonCodeSchema = z.enum(REASON_CODES);
export type ReasonCode = z.infer<typeof ReasonCodeSchema>;
