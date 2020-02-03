import { camelCase, snakeCase } from 'lodash';

export class ObjectConverter {
  static underscoreToCamelCase(object: any): any {
    if (typeof object === 'string') {
      return object;
    }

    if (Array.isArray(object)) {
      const newObjects: any[] = [];
      for (const obj of object) {
        newObjects.push(ObjectConverter.underscoreToCamelCase(obj));
      }

      return newObjects;
    }

    const newObject: any = {};
    for (const key of Object.keys(object)) {
      const newKey = camelCase(key);
      if (Array.isArray(object[key])) {
        newObject[newKey] = ObjectConverter.underscoreToCamelCase(object[key]);
      } else if (typeof object[key] === 'object') {
        newObject[newKey] = ObjectConverter.underscoreToCamelCase(object[key]);
      } else {
        newObject[newKey] = object[key];
      }
    }

    return newObject;
  }

  static camelCaseToUnderscore(object: any): any {
    if (typeof object === 'string') {
      return object;
    }

    if (Array.isArray(object)) {
      const newObjects: any[] = [];
      for (const obj of object) {
        newObjects.push(ObjectConverter.camelCaseToUnderscore(obj));
      }

      return newObjects;
    }

    const newObject: any = {};
    for (const key of Object.keys(object)) {
      const newKey = snakeCase(key);
      if (Array.isArray(object[key])) {
        newObject[newKey] = ObjectConverter.camelCaseToUnderscore(object[key]);
      } else if (typeof object[key] === 'object') {
        newObject[newKey] = ObjectConverter.camelCaseToUnderscore(object[key]);
      } else {
        newObject[newKey] = object[key];
      }
    }

    return newObject;
  }
}
