import { camelCase, snakeCase } from 'lodash';

interface ConfigInterface {
  recursive?: boolean;
  ignore?: string[];
}

const defaultConfig: ConfigInterface = {
  recursive: false,
  ignore: ['metadata'],
};

export class ObjectConverter {
  static underscoreToCamelCase(
    object: any,
    config?: ConfigInterface = defaultConfig,
  ): any {
    config = {
      ...defaultConfig,
      ...config,
    };

    const primitives = ['string', 'number'];

    if (primitives.includes(typeof object)) {
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

      const isDate = object[key] instanceof Date;

      if (Array.isArray(object[key])) {
        newObject[newKey] = ObjectConverter.underscoreToCamelCase(
          object[key],
          config,
        );
      } else if (
        typeof object[key] === 'object' &&
        config?.recursive &&
        config?.ignore?.includes(key) === false &&
        isDate === false
      ) {
        newObject[newKey] = ObjectConverter.underscoreToCamelCase(
          object[key],
          config,
        );
      } else {
        newObject[newKey] = object[key];
      }
    }

    return newObject;
  }

  static camelCaseToUnderscore(
    object: any,
    config?: ConfigInterface = defaultConfig,
  ): any {
    config = {
      ...defaultConfig,
      ...config,
    };

    const primitives = ['string', 'number'];

    if (primitives.includes(typeof object)) {
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

      const isDate = object[key] instanceof Date;

      if (Array.isArray(object[key])) {
        newObject[newKey] = ObjectConverter.camelCaseToUnderscore(
          object[key],
          config,
        );
      } else if (
        typeof object[key] === 'object' &&
        config?.recursive &&
        config?.ignore?.includes(key) === false &&
        isDate === false
      ) {
        newObject[newKey] = ObjectConverter.camelCaseToUnderscore(
          object[key],
          config,
        );
      } else {
        newObject[newKey] = object[key];
      }
    }

    return newObject;
  }
}
