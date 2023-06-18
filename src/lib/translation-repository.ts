import { TranslationCollectedMap } from "./model/translation-collected-map";
import {
  Observable,
  ReplaySubject,
  Subject,
  filter,
  from,
  map,
  merge,
  of,
} from "rxjs";
import { TranslationEvent } from "./model/translation-event";
import { TranslationParameter } from "./model/translation-parameter";
import {
  TranslationPart,
  TranslationStringMap,
} from "./model/translation-part";
import { EnvironmentController } from "./environment-controller";
import {
  AsyncActionLazyloadHandler,
  LinearActionLazyloadHandler,
  RxActionLazyloadHandler,
  TranslationLazyloadHelper,
  TranslationPartLinears,
} from "./translation-lazyload-helper";
import { TranslatorText } from "./model";

/**
 * The translation repository manages translations, translates incoming key and listens the language changes at environment controllers.
 * and loads the translations by provided lazyload handlers
 */
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

  /**
   *
   * @returns the current lazyload helper
   */
  public getLazyloadHelper() {
    return this._lazyloadHelper;
  }

  /**
   * checks the language is registered
   * @param lang requested language
   * @returns `true` if registered, otherwise `false`
   */
  public hasLanguage(lang: string) {
    return this._collected[lang] != null;
  }

  /**
   * returns the current language
   * @returns the current language
   */
  public getCurrentLanguage(): string | undefined {
    return this._currentLanguage;
  }

  /**
   *  Returns the observable listens any changes (translation part registration or language changes)
   * @returns the observable listens any changes (translation part registration or language changes)
   */
  public changeDetection() {
    return this._changeDetected.asObservable();
  }

  /**
   * Post operations after language changes
   */
  private languageAfterSet() {
    this._changeDetected.next("LANGUAGE_CHANGE");
    this.tryToGetNeededThings();
  }

  /**
   * Loads the parts with lazyload handlers
   */
  async tryToGetNeededThings() {
    if (this._currentLanguage) {
      const lists = this._lazyloadHelper.getList();
      await lists.forEach(async (a) => {
        const object = a.fetchObjects(this._currentLanguage!);
        /**
         * checking `object instanceof Promise`
         * or `object instanceof Observables<🥔>` is risky
         * because mixes the rxjs class references in this library and another project that uses this as depency
         * [[https://imgflip.com/i/7ps2cv]]
         * */

        if (a instanceof AsyncActionLazyloadHandler) {
          this.registerParts(
            await (object as Promise<TranslationPartLinears>),
            this._currentLanguage!
          );
        } else if (a instanceof RxActionLazyloadHandler) {
          (object as Observable<TranslationPartLinears>).subscribe(
            (incomingObj) => {
              this.registerParts(incomingObj, this._currentLanguage!);
            }
          );
        } else {
          this.registerParts(
            object as TranslationPartLinears,
            this._currentLanguage!
          );
        }
      });
    }
  }

  /**
   * Changes the languages
   * @param language
   */
  private setLanguage(language: string) {
    console.debug(`TRANSLATOR: Language changed to ${language}`);
    this._currentLanguage = language;
    this.languageAfterSet();
    this.tryToGetNeededThings();
  }

  /**
   * Registers parts.
   * @param part Parts is like this
   * ```
      {
          prefix: 'generic', // prefix is optional
          stringMap: {
            hello: 'Merhaba, {name}',
          },
        },
   * ```
   * @param lang the language that part should be registered into
   */
  registerParts(part: TranslationPart | TranslationPart[], lang: string) {
    if (part instanceof Array) {
      this._registerParts(part, lang);
    } else {
      this._registerPart(part, lang);
    }
  }

  /**
   * registers parts (array)
   * @param parts
   * @param language
   */
  private _registerParts(parts: TranslationPart[], language: string) {
    parts.forEach((a) => this._registerPart(a, language, false));
    this._changeDetected.next("PART_REGISTERED");
  }

  /**
   * registers parts (singular)
   * @param parts
   * @param language
   */
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
      const keyPrefixed = [part.prefix, key].filter((a) => a).join(".");
      collection[keyPrefixed] = value;
    });
    if (emit) this._changeDetected.next("PART_REGISTERED");
  }

  /**
   * Translates the text.
   * @param translatorText The text, or with parameters. Accepts `string` or `{key: string; parameters?: TranslationParameter}`
   * @returns The result. if there is no translation found, the text resulted with same
   */
  getString(translatorText: TranslatorText): string {
    let parameters: TranslationParameter, key: string;
    if (typeof translatorText == "string") {
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
        let text = languagePool?.[key] || key;
        Object.entries(parameters)?.forEach(([key, value]) => {
          const keyNeutralized = `{${key}}`;
          text = text.split(keyNeutralized).join(value);
        });
        return text;
      }
    }
    // console.warn(
    //   `TRANSLATOR: Unable to get string with key '${key}'. Returning empty`
    // );
    return key;
  }

  /**
   * Returns the observer that sends the text when the language and translation part changes.
   *
   * @param translatorText
   * @returns
   */
  getStringListenChanges(translatorText: TranslatorText) {
    return merge(
      of(this.getString(translatorText)),
      this._changeDetected.pipe(
        // filter((a) => a == 'PART_REGISTERED'),
        map((a: TranslationEvent) => {
          console.debug(`TRANSLATOR ${a}`);
          return this.getString(translatorText);
        })
      )
    );
  }
}
