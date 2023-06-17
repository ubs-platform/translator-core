import { ReplaySubject } from 'rxjs';
import { TranslationEvent } from './model';

/**
 * Controls the whole system language and other stgs.
 */
export class EnvironmentController {
  private _currentLanguageSubject = new ReplaySubject<string>(1);
  private _currentLanguage = '';
  private readonly LANGUAGE_KEY_LOCALSTORAGE = 'CURRENT_LANGUAGE';

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

  public getLanguage() {
    return this._currentLanguageSubject.asObservable();
  }

  private languageAfterSet() {
    if (this.useLocalStorage) {
      localStorage.setItem(
        this.LANGUAGE_KEY_LOCALSTORAGE,
        this._currentLanguage!
      );
    }
  }

  setLanguage(language: string) {
    this._currentLanguage = language;
    this._currentLanguageSubject.next(language);
    this.languageAfterSet();
  }

  private static _mainBoss: EnvironmentController;
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
