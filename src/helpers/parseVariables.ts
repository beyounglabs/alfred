import * as vm from 'vm';

export function parseVariables(string: String, data: { [x: string]: any }) {
  const variables = [] as any;
  const list = [] as any;

  for (const text of string.split('$')) {
    const textWith$ = '$' + text;

    const result = /\${([\w.]+)}/g.exec(textWith$);

    if (result == null) {
      list.push(text);
      continue;
    }

    variables.push(result[1]);

    list.push(textWith$.replace(result[0], ''));
  }

  const context = vm.createContext(data);

  const response = vm.runInContext(
    `
    String.raw(
      { raw: ${JSON.stringify(list)} },
      ${variables.join(', ')}
    )
  `,
    context,
  );

  return JSON.parse(response);
}
