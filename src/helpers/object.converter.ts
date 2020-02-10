import { camelCase, snakeCase } from 'lodash';

interface ConfigInterface {
  recursive?: boolean;
}

export class ObjectConverter {
  static underscoreToCamelCase(object: any, config?: ConfigInterface): any {
    if (typeof object === 'string') {
      return object;
    }

    if (object === null || object === undefined) {
      return object;
    }

    if (Array.isArray(object)) {
      const newObjects: any[] = [];
      for (const obj of object) {
        newObjects.push(ObjectConverter.underscoreToCamelCase(obj, config));
      }

      return newObjects;
    }

    const newObject: any = {};
    for (const key of Object.keys(object)) {
      const newKey = camelCase(key);
      if (Array.isArray(object[key])) {
        newObject[newKey] = ObjectConverter.underscoreToCamelCase(object[key], config);
      } else if (typeof object[key] === 'object'  && config?.recursive) {
        newObject[newKey] = ObjectConverter.underscoreToCamelCase(object[key], config);
      } else {
        newObject[newKey] = object[key];
      }
    }

    return newObject;
  }

  static camelCaseToUnderscore(object: any, config?: ConfigInterface): any {
    if (typeof object === 'string') {
      return object;
    }

    if (object === null || object === undefined) {
      return object;
    }

    if (Array.isArray(object)) {
      const newObjects: any[] = [];
      for (const obj of object) {
        newObjects.push(ObjectConverter.camelCaseToUnderscore(obj, config));
      }

      return newObjects;
    }

    const newObject: any = {};
    for (const key of Object.keys(object)) {
      const newKey = snakeCase(key);
      if (Array.isArray(object[key])) {
        newObject[newKey] = ObjectConverter.camelCaseToUnderscore(object[key], config);
      } else if (typeof object[key] === 'object' && config?.recursive) {
        newObject[newKey] = ObjectConverter.camelCaseToUnderscore(object[key], config);
      } else {
        newObject[newKey] = object[key];
      }
    }

    return newObject;
  }
}
