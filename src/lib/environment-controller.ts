import { ReplaySubject } from "rxjs";
import { TranslationEvent } from "./model";

/**
 * Controls the whole system language and other stgs.
 */
export class EnvironmentController {
  private _currentLanguageSubject = new ReplaySubject<string>(1);
  private _currentLanguage = "";
  private readonly LANGUAGE_KEY_LOCALSTORAGE = "CURRENT_LANGUAGE";

  constructor(initialLanguage?: string, private useLocalStorage = true) {
    if (
      useLocalStorage &&
      localStorage.getItem(this.LANGUAGE_KEY_LOCALSTORAGE)
    ) {
      // localstorage save is enabled and if language is already saved
      this.setLanguage(localStorage.getItem(this.LANGUAGE_KEY_LOCALSTORAGE)!);
    } else {
      // if there is initialLanguage
      this.setLanguage(initialLanguage!);
    }
  }

  /**
   * Returns an observer what observes language changes. (And sends current language when subscribed currently)
   * @returns
   */
  public getLanguage() {
    return this._currentLanguageSubject.asObservable();
  }

  /**
   * Saves selected language to local storage if enabled `useLocalStorage`
   */
  private languageAfterSet() {
    if (this.useLocalStorage) {
      localStorage.setItem(
        this.LANGUAGE_KEY_LOCALSTORAGE,
        this._currentLanguage!
      );
    }
  }

  /**
   * Changes language
   * @param language will be selected
   */
  setLanguage(language: string) {
    this._currentLanguage = language;
    this._currentLanguageSubject.next(language);
    this.languageAfterSet();
  }

  private static _mainBoss: EnvironmentController;

  /**
   * Returns a existing environment controller if exist , otherwise it will be construct a new environment controller and it returned (first call)
   * @param initialLanguageIfNotExist initial language (in first call, there is no existing yet)
   * @param useLocalStorageIfNotExist determines read and save local storage (in first call, there is no existing yet)
   * @returns
   */
  static getEnvironmentController(
    initialLanguageIfNotExist?: string,
    useLocalStorageIfNotExist = true
  ): EnvironmentController {
    if (!this._mainBoss) {
      this._mainBoss = new EnvironmentController(
        initialLanguageIfNotExist,
        useLocalStorageIfNotExist
      );
    }
    return this._mainBoss;
  }
}
