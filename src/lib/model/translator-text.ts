import { TranslationParameter } from "./translation-parameter";

export type TranslatorText = TranslatorTextDetail | string | null | undefined;

export interface TranslatorTextDetail {
  key: string;
  parameters?: TranslationParameter;
}
