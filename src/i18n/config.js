export const DEFAULT_LOCALE = "en";

export const SUPPORTED_LOCALES = [
  { code: "en", htmlLang: "en", label: "English", nativeLabel: "English" },
  { code: "zh", htmlLang: "zh-CN", label: "Chinese", nativeLabel: "中文" },
  { code: "fr", htmlLang: "fr", label: "French", nativeLabel: "Français" },
  { code: "ja", htmlLang: "ja", label: "Japanese", nativeLabel: "日本語" },
  { code: "es", htmlLang: "es", label: "Spanish", nativeLabel: "Español" },
];

const supportedCodes = new Set(SUPPORTED_LOCALES.map((locale) => locale.code));

export function normalizeLocale(input) {
  if (!input) {
    return DEFAULT_LOCALE;
  }

  const lower = String(input).toLowerCase();
  const direct = lower.split("-")[0];

  return supportedCodes.has(direct) ? direct : DEFAULT_LOCALE;
}

export function getLocaleMeta(locale) {
  return SUPPORTED_LOCALES.find((entry) => entry.code === locale) || SUPPORTED_LOCALES[0];
}
