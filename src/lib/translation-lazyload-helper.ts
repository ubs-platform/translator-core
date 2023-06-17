import { Observable, Subject } from 'rxjs';
import { TranslationPart } from './model';

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

export class LinearActionLazyloadHandler implements ILazyloadHandler {
  constructor(
    public fetchObjects: (language: string) => TranslationPartLinears
  ) {}
}

export class RxActionLazyloadHandler implements ILazyloadHandler {
  constructor(
    public fetchObjects: (language: string) => TranslationPartObservable
  ) {}
}

export class AsyncActionLazyloadHandler implements ILazyloadHandler {
  constructor(
    public fetchObjects: (language: string) => TranslationPartAsync
  ) {}
}

export class TranslationLazyloadHelper {
  private _lazyloaders: Array<ILazyloadHandler> = [];

  private _updated = new Subject<ILazyloadHandler[]>();

  public getOnUpdated() {
    return this._updated.asObservable();
  }

  public insert(...llhs: ILazyloadHandler[]) {
    const ids = llhs.map((llh) => {
      return this._lazyloaders.push(llh);
    });
    this._updated.next(this._lazyloaders);
    return ids;
  }

  public remove(id: number) {
    this._lazyloaders.splice(id, 1);
  }

  public getList() {
    return this._lazyloaders;
  }
}
