export class Collection<T> {
  protected resources: T[];
  constructor(data: T | T[] | Collection<T>) {
    this.resources = new Array<T>();

    if (data instanceof Array) {
      this.resources.push(...data);
    }
    if (data instanceof Collection) {
      this.resources.push(...data.toArray());
    }

    if (!(data instanceof Array) && !(data instanceof Collection)) {
      this.resources.push(data);
    }
  }

  public toArray(): T[] {
    return this.resources;
  }
}
