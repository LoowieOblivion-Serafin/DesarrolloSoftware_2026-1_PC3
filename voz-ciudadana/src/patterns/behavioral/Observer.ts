export interface Observer<T> {
  update(payload: T): void;
}

export interface Subject<T> {
  attach(o: Observer<T>): void;
  detach(o: Observer<T>): void;
  notify(payload: T): void;
}
