export interface VariablesInterface {
  [name: string]: {
    value: any;
    type: 'number' | 'string' | 'object';
  };
}
