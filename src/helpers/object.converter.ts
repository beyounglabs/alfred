import { camelCase } from 'lodash';

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
      const newKey = key;
      newObject[newKey] = camelCase(object[key]);
    }

    return newObject;
  }
}
