import { Document, Schema } from 'mongoose';
import { cloneDeep } from 'lodash';

export class BaseEntity {
  protected _model: Document;
  protected _primaryKey = 'id';
  protected _identifier: string | number;
  protected _originalProperties = {};
  protected _modifiedProperties = {};
  protected _excluded = [];

  constructor(item: Document | any) {
    this._model = item;
    let paths = {};
    if (item instanceof Document) {
      paths = this._model.schema?.paths ?? {};
    } else {
      paths = item;
    }

    const properties = {};
    const typeStr = typeof item;

    for (const key in paths) {
      if (paths[key] instanceof Schema.Types.ObjectId) {
        this._identifier = item[key];
        this._primaryKey = 'id';
        if (!('id' in this)) {
          Object.defineProperty(this, this._primaryKey, {
            get: () => {
              return this._identifier.toString();
            },
          });
        }
      }

      if (key == '__v' || paths[key] instanceof Schema.Types.ObjectId) {
        continue;
      }

      properties[key] = item[key];
    }

    for (const key in properties) {
      Object.defineProperty(this, key, {
        get: () => {
          return this.getAttribute(key);
        },
        set: (value: any) => {
          return this.setAttribute(key, value);
        },
      });
    }

    this._originalProperties = properties;
  }

  model(): Document {
    return this._model;
  }

  getAttributes(): any {
    const attributes = this.getRawAttributes();

    this._excluded.forEach((value) => {
      delete attributes[value];
    });

    return attributes;
  }

  getRawAttributes(): any {
    const attributes = cloneDeep(this._originalProperties);
    Object.assign(attributes, this._modifiedProperties);

    return attributes;
  }

  getAttribute(name: string): any {
    return this._modifiedProperties[name] ?? this._originalProperties[name];
  }

  setAttribute(name: string, value: any) {
    this._modifiedProperties[name] = value;
    return this;
  }

  getKey() {
    return this._identifier.toString();
  }

  getKeyName() {
    return this._primaryKey;
  }

  static transform(item) {
    const transformMap = {
      // UserDocument.,
    };
  }
}
