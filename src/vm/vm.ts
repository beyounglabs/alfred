import * as vm from 'vm';
import { VariablesInterface } from './variables.interface';

export class Vm {
  public async run(code: string, variables: VariablesInterface): Promise<any> {
    const variableKeys = Object.keys(variables);
    const variablesDefinitions = variableKeys
      .map(variableKey => {
        const variable = variables[variableKey];
        let value: any;

        if (variable.type === 'number') {
          value = variable.value || 0;
        } else if (variable.type === 'string') {
          value = `'${variable.value || ''}'`;
        } else if (variable.type === 'object') {
          value = `JSON.parse('${
            variable.value ? JSON.stringify(variable.value) : {}
          }')`;
        }

        return `const ${variableKey} = ${value};`;
      })
      .join('\n      ');

    const codeToRun = `   (() => {
      ${variablesDefinitions}

      return (${code});
    })()`;

    return vm.runInThisContext(codeToRun);
  }
}
