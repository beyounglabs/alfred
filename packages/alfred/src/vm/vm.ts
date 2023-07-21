import * as vm from 'vm';
import { VariablesInterface } from './variables.interface';

export class Vm {
  public async run(code: string, variables: VariablesInterface): Promise<any> {
    const newVariables = {};
    for (const code of Object.keys(variables)) {
      newVariables[code] = variables[code].value;
    }

    const variablesContext = vm.createContext(newVariables);

    const codeToRun = `(() => {
      return (${code});
    })()`;

    return vm.runInContext(codeToRun, variablesContext);
  }
}
