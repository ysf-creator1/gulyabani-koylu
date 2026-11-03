// ESLint ayarı (team.md Code Style; security-design: IP okuma yasağı, betik enjeksiyonu yasağı;
// NFR11.1: oyuncuya görünen Türkçe metin kodda değil content/tr.json'da).
import tseslint from 'typescript-eslint';

const TURKISH_LETTERS = '[çğıöşüÇĞİÖŞÜ]';

// IP ve vekil başlıkları hiçbir yerde okunmaz (NFR7.11, project.md Forbidden).
const ipRules = {
  'no-restricted-properties': [
    'error',
    { property: 'remoteAddress', message: 'IP adresi okunmaz (NFR7.11).' },
    { property: 'remoteFamily', message: 'IP bilgisi okunmaz (NFR7.11).' },
  ],
};

const restrictedSyntax = [
  {
    selector: 'Literal[value=/x-forwarded-for/i]',
    message: 'X-Forwarded-For okunmaz (NFR7.11).',
  },
  {
    selector: 'Literal[value=/^forwarded$/i]',
    message: 'Forwarded başlığı okunmaz (NFR7.11).',
  },
  {
    selector: "JSXAttribute[name.name='dangerouslySetInnerHTML']",
    message: 'HTML olarak ekleme yasak (NFR7.9).',
  },
];

// Uygulama kodunda oyuncuya görünen Türkçe metin bulunmaz (BR13.1, NFR11.1).
const noEmbeddedText = [
  ...restrictedSyntax,
  {
    selector: `Literal[value=/${TURKISH_LETTERS}/]`,
    message: 'Oyuncuya görünen metin content/tr.json dosyasında olmalı.',
  },
  {
    selector: `TemplateElement[value.raw=/${TURKISH_LETTERS}/]`,
    message: 'Oyuncuya görünen metin content/tr.json dosyasında olmalı.',
  },
  {
    selector: 'JSXText[value=/[A-Za-zçğıöşüÇĞİÖŞÜ]/]',
    message: 'JSX içinde düz metin yok; t() ile tr.json anahtarı kullan.',
  },
];

export default tseslint.config(
  {
    ignores: [
      'node_modules/',
      'dist/',
      'coverage/',
      'reports/',
      'test-results/',
      'playwright-report/',
      'aidlc/',
      '.claude/',
      '.aidlc/',
    ],
  },
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },
  {
    // Uygulama kodu: IP okuma, HTML ekleme ve gömülü oyuncu metni yasak. Testler vekil
    // başlığını bilerek gönderip okunmadığını sınar; bu yüzden kurallar src/ ile sınırlıdır.
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    rules: {
      ...ipRules,
      'no-restricted-syntax': ['error', ...noEmbeddedText],
    },
  },
);
