// C4 — İçerik kataloğu: rol tanımları (roles.json) ve Türkçe metin paketi (tr.json).
// Program açılırken yüklenir; biçim denetiminden geçmezse program açılmaz (C4 kuralı).
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { z } from 'zod';
import { PHASES, ROLE_IDS, SIDES, STEP_CURSORS, STEP_STATUSES } from '../shared/domain.ts';
import { REASON_CODES } from '../shared/reasonCodes.ts';

export const RoleDefinitionSchema = z.object({
  roleId: z.enum(ROLE_IDS),
  name: z.string().min(1),
  side: z.enum(SIDES),
  sideIcon: z.string().min(1),
  abilityText: z.string().min(1),
  wakeTiming: z.enum(['never', 'first_night', 'every_night', 'on_death']),
  winCondition: z.string().min(1),
  strategyTip: z.string().min(1),
  flavorText: z.string().min(1),
  mandatory: z.boolean(),
  copiesWhenEnabled: z.number().int().min(1),
  presets: z.array(z.enum(['beginner', 'classic', 'full_village'])),
});
export type RoleDefinition = z.infer<typeof RoleDefinitionSchema>;

const RolesFileSchema = z.object({
  version: z.literal(1),
  roles: z.array(RoleDefinitionSchema).min(1),
});

export const TextBundleSchema = z.record(
  z.string().regex(/^[a-z][A-Za-z0-9_]*(\.[A-Za-z0-9_]+)+$/),
  z.string().min(1),
);
export type TextBundle = z.infer<typeof TextBundleSchema>;

export interface Catalog {
  roles: RoleDefinition[];
  text: TextBundle;
}

/** Kodun ve sözleşmenin zorunlu tuttuğu metin anahtarları (NFR11.1). */
export function requiredTextKeys(): string[] {
  return [
    ...REASON_CODES.map((code) => `error.${code}`),
    ...PHASES.map((phase) => `phase.${phase}`),
    // Gece fazlarında beklenen işlem adıma göredir (aşağıdaki STEP_CURSORS satırı).
    ...PHASES.filter((phase) => phase !== 'first_night' && phase !== 'night').map(
      (phase) => `expected.${phase}`,
    ),
    ...STEP_CURSORS.map((step) => `step.${step}`),
    ...STEP_CURSORS.map((step) => `expected.${step}`),
    ...STEP_STATUSES.map((status) => `stepStatus.${status}`),
    ...SIDES.map((side) => `side.${side}`),
    'privacy.short',
    'privacy.title',
  ];
}

export class CatalogError extends Error {
  readonly problems: string[];
  constructor(problems: string[]) {
    super(`content catalog invalid (${problems.length} problems)`);
    this.name = 'CatalogError';
    this.problems = problems;
  }
}

/** Ham JSON nesnelerinden kataloğu doğrular; sorun varsa CatalogError fırlatır. */
export function validateCatalog(rolesJson: unknown, textJson: unknown): Catalog {
  const problems: string[] = [];
  const roles = RolesFileSchema.safeParse(rolesJson);
  const text = TextBundleSchema.safeParse(textJson);
  if (!roles.success) problems.push('roles.json schema');
  if (!text.success) problems.push('tr.json schema');
  if (!roles.success || !text.success) throw new CatalogError(problems);

  const bundle = text.data;
  for (const key of requiredTextKeys()) {
    if (!(key in bundle)) problems.push(`missing text key: ${key}`);
  }
  for (const role of roles.data.roles) {
    for (const key of [
      role.name,
      role.abilityText,
      role.winCondition,
      role.strategyTip,
      role.flavorText,
    ]) {
      if (!(key in bundle)) problems.push(`missing role text key: ${key}`);
    }
  }
  for (const roleId of ROLE_IDS) {
    if (!roles.data.roles.some((role) => role.roleId === roleId))
      problems.push(`missing role: ${roleId}`);
  }
  if (problems.length > 0) throw new CatalogError(problems);
  return { roles: roles.data.roles, text: bundle };
}

/** content/ klasöründen kataloğu okur ve doğrular. Dosya okunamazsa da CatalogError. */
export function loadCatalog(contentDir: string): Catalog {
  let rolesJson: unknown;
  let textJson: unknown;
  try {
    rolesJson = JSON.parse(readFileSync(join(contentDir, 'roles.json'), 'utf8'));
    textJson = JSON.parse(readFileSync(join(contentDir, 'tr.json'), 'utf8'));
  } catch (error) {
    throw new CatalogError([`catalog read failed: ${(error as Error).name}`]);
  }
  return validateCatalog(rolesJson, textJson);
}
