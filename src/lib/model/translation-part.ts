export type TranslationStringMap = { [key: string]: string };
export interface TranslationPart {
  prefix?: string;
  // language: string;
  stringMap: TranslationStringMap;
}
