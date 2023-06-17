import { TranslationParameter } from './translation-parameter';

export type TranslatorText = TranslatorTextDetail | string;

export interface TranslatorTextDetail {
  key: string;
  parameters?: TranslationParameter;
}
