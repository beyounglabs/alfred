interface RequestError extends Error {
  response?: {
    status: number;
    statusText: string;
    data: any;
    config: {
      url: string;
      method: 'get' | 'post' | 'head' | 'put' | 'patch' | 'delete';
    };
  };
}

export function getRequestErrorLog(error: RequestError) {
  if (error.response == null) {
    return {};
  }

  let { status, statusText, data, config } = error.response;
  const newLineRegex = /(\r\n|\n)/;

  // When `data` is a string it's problably HTML, so we split on each line
  // to print them better.
  if (typeof data === 'string') {
    data = data
      .split(newLineRegex)
      .filter(line => newLineRegex.test(line) === false);
  }

  return {
    url: config.url,
    method: config.method,
    status,
    statusText,
    response: data,
  };
}
