import { TranslationCollectedMap } from './model/translation-collected-map';
import {
  Observable,
  ReplaySubject,
  Subject,
  filter,
  from,
  map,
  merge,
  of,
} from 'rxjs';
import { TranslationEvent } from './model/translation-event';
import { TranslationParameter } from './model/translation-parameter';
import {
  TranslationPart,
  TranslationStringMap,
} from './model/translation-part';
import { EnvironmentController } from './environment-controller';
import { TranslationLazyloadHelper } from './translation-lazyload-helper';
import { TranslatorText } from './model';

export class TranslationRepository {
  private _collected: TranslationCollectedMap = {};
  private _changeDetected = new Subject<TranslationEvent>();
  private _currentLanguage?: string | undefined;
  constructor(private _lazyloadHelper = new TranslationLazyloadHelper()) {
    EnvironmentController.getEnvironmentController()
      .getLanguage()
      .subscribe((a) => {
        this.setLanguage(a);
        this._lazyloadHelper.getOnUpdated().subscribe(() => {
          this.tryToGetNeededThings();
        });
      });
  }

  public getLazyloadHelper() {
    return this._lazyloadHelper;
  }

  public hasLanguage(lang: string) {
    return this._collected[lang] != null;
  }

  public getCurrentLanguage(): string | undefined {
    return this._currentLanguage;
  }

  public changeDetection() {
    return this._changeDetected.asObservable();
  }

  private languageAfterSet() {
    this._changeDetected.next('LANGUAGE_CHANGE');
    this.tryToGetNeededThings();
  }

  async tryToGetNeededThings() {
    if (this._currentLanguage) {
      const lists = this._lazyloadHelper.getList();
      await lists.forEach(async (a) => {
        const object = a.fetchObjects(this._currentLanguage!);
        if (object instanceof Promise) {
          this.registerParts(await object, this._currentLanguage!);
        } else if (object instanceof Observable) {
          object.subscribe((incomingObj) => {
            this.registerParts(incomingObj, this._currentLanguage!);
          });
        } else {
          this.registerParts(object, this._currentLanguage!);
        }
      });
    }
  }

  private setLanguage(language: string) {
    console.debug(`TRANSLATOR: Language changed to ${language}`);
    this._currentLanguage = language;
    this.languageAfterSet();
    this.tryToGetNeededThings();
  }

  registerParts(part: TranslationPart | TranslationPart[], lang: string) {
    if (part instanceof Array) {
      this._registerParts(part, lang);
    } else {
      this._registerPart(part, lang);
    }
  }

  private _registerParts(parts: TranslationPart[], language: string) {
    parts.forEach((a) => this._registerPart(a, language, false));
    this._changeDetected.next('PART_REGISTERED');
  }

  private _registerPart(part: TranslationPart, language: string, emit = true) {
    console.debug(`TRANSLATOR: Registering part`);

    let collection: TranslationStringMap;
    if (this._collected[language]) {
      collection = this._collected[language];
    } else {
      collection = {};
      this._collected[language] = collection;
    }

    Object.entries(part.stringMap).forEach(([key, value]) => {
      const keyPrefixed = [part.prefix, key].filter((a) => a).join('.');
      collection[keyPrefixed] = value;
    });
    if (emit) this._changeDetected.next('PART_REGISTERED');
  }

  getString(translatorText: TranslatorText): string {
    let parameters: TranslationParameter, key: string;
    if (typeof translatorText == 'string') {
      parameters = {};
      key = translatorText;
    } else {
      parameters = translatorText.parameters || {};
      key = translatorText.key;
    }

    if (!parameters) parameters = {};
    if (this._currentLanguage) {
      let languagePool = this._collected[this._currentLanguage];
      if (languagePool) {
        let text = languagePool?.[key] || '';
        Object.entries(parameters)?.forEach(([key, value]) => {
          const keyNeutralized = `{${key}}`;
          text = text.split(keyNeutralized).join(value);
        });
        return text || key;
      }
    }
    // console.warn(
    //   `TRANSLATOR: Unable to get string with key '${key}'. Returning empty`
    // );
    return key;
  }

  getStringListenChanges(translatorText: TranslatorText) {
    return merge(
      of(this.getString(translatorText)),
      this._changeDetected.pipe(
        // filter((a) => a == 'PART_REGISTERED'),
        map((a) => {
          console.debug(`TRANSLATOR ${a}`);
          return this.getString(translatorText);
        })
      )
    );
  }
}
