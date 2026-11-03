// Oyuncuya görünen bütün metinler content/tr.json'dan gelir (BR13.1, NFR11). Kodda metin yoktur;
// red nedenleri error.<kod> anahtarıyla gösterilir.
import tr from '../../content/tr.json' with { type: 'json' };

const bundle: Record<string, string> = tr;

/** Anahtarın metnini döndürür; {ad} yer tutucuları verilen değerlerle doldurulur. */
export function t(key: string, params: Record<string, string | number> = {}): string {
  const text = bundle[key];
  if (text === undefined) return key;
  return text.replace(/\{(\w+)\}/g, (_, name: string) => String(params[name] ?? ''));
}

export function hasText(key: string): boolean {
  return key in bundle;
}

export function errorText(reasonCode: string): string {
  return t(`error.${reasonCode}`);
}
