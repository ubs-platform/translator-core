import { Observable, Subject } from "rxjs";
import { TranslationPart } from "./model";

export type TranslationPartObservable = Observable<
  TranslationPart | TranslationPart[]
>;

export type TranslationPartLinears = TranslationPart | TranslationPart[];
export type TranslationPartAsync = Promise<TranslationPart | TranslationPart[]>;

export interface ILazyloadHandler {
  fetchObjects(
    language: string
  ): TranslationPartObservable | TranslationPartLinears | TranslationPartAsync;
}

/**
 * Lazyload helper that returns Translation parts directly
 */
export class LinearActionLazyloadHandler implements ILazyloadHandler {
  constructor(
    public fetchObjects: (language: string) => TranslationPartLinears
  ) {}
}

/**
 * Lazyload helper that returns a rxjs observable
 */
export class RxActionLazyloadHandler implements ILazyloadHandler {
  constructor(
    public fetchObjects: (language: string) => TranslationPartObservable
  ) {}
}

/**
 * Lazyload helper that returns Translation parts asynchronously
 */
export class AsyncActionLazyloadHandler implements ILazyloadHandler {
  constructor(
    public fetchObjects: (language: string) => TranslationPartAsync
  ) {}
}

/**
 * That holds a list bunch of actions that returns Translation parts in three ways.
 */
export class TranslationLazyloadHelper {
  /**
   * holds all actions (aka lazyload handlers)
   */
  private _lazyloaders: Array<ILazyloadHandler> = [];

  /**
   * when a lazyload helper registered, that will be triggered and lazyload handlers list will be sent
   */
  private _updated = new Subject<ILazyloadHandler[]>();

  /**
   * when a lazyload helper registered, that will be triggered and lazyload handlers list will be sent
   * @returns
   */
  public getOnUpdated() {
    return this._updated.asObservable();
  }

  /**
   * add new lazyload handlers
   * @param llhs
   * @returns ids of the lazyload helpers (that lazyload handlers can be removed by these ids)
   */
  public insert(...llhs: ILazyloadHandler[]) {
    const ids = llhs.map((llh) => {
      return this._lazyloaders.push(llh);
    });
    this._updated.next(this._lazyloaders);
    return ids;
  }

  /**
   * Removes a lazyload handlers
   * @param id returned in `insert` method
   */
  public remove(id: number) {
    this._lazyloaders.splice(id, 1);
  }

  /**
   *
   * @returns the lazyload handlers
   */
  public getList() {
    return this._lazyloaders;
  }
}
