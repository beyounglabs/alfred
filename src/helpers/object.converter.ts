import { camelCase, snakeCase } from 'lodash';

export class ObjectConverter {
  static underscoreToCamelCase(object: any): any {
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
      newObject[newKey] = object[key];
    }

    return newObject;
  }

  static camelCaseToUnderscore(object: any): any {
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
      newObject[newKey] = object[key];
    }

    return newObject;
  }
}
