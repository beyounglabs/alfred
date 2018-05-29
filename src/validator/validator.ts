import { merge } from 'lodash';
import * as ValidatorJS from 'validatorjs';
export class Validator {
  public getDefaultErrorMessages(): any {
    return {
      required: 'Esse campo é obrigatório',
      email: 'E-mail inválido',
      numeric: 'Valor inválido',
      digits: 'Esse campo deve ter :digits dígitos',
      max: {
        numeric: 'O tamanho máximo desse campo é :max',
        string: 'O tamanho máximo desse campo é :max',
      },
      size: {
        numeric: 'Esse campo deve ter :size dígitos',
        string: 'Esse campo deve ter :size dígitos',
      },
      in: 'Valor inválido',
      string: 'Esse valor deve ser uma string',
    };
  }

  public register(rule: string, callback: Function, message: string) {
    ValidatorJS.registerAsync(rule, callback, message);
  }

  public async validate(data, rules, customErrorMessages?) {
    const validator = new ValidatorJS(
      data,
      rules,
      merge(customErrorMessages, this.getDefaultErrorMessages()),
    );

    const fails = await new Promise(resolve => {
      validator.fails(() => {
        resolve(true);
      });

      validator.passes(() => {
        resolve(false);
      });
    });

    if (fails) {
      return validator.errors.errors;
    }

    return {};
  }
}
