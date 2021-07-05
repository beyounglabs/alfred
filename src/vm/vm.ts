import * as vm from 'vm';
import { VariablesInterface } from './variables.interface';

export class Vm {
  public async run(code: string, variables: VariablesInterface): Promise<any> {
    const variablesContext = vm.createContext(variables);

    const codeToRun = `(() => {
      return (${code});
    })()`;

    return vm.runInContext(codeToRun, variablesContext);
  }
}
