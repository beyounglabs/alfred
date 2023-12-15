import { Logger } from "../logger-v2/logger";

export async function promiseTimeout<T = any>(
  functions: Array<() => Promise<T>>,
  timeout: number,
  label: string,
): Promise<T> {
  try {
    const func = functions[0];
    const firstPromise = func();

    return await new Promise((resolve, reject) => {
      let isResolved = false;
      firstPromise
        .then(value => {
          isResolved = true;
          resolve(value);
        })
        .catch(e => reject(e));

      setTimeout(() => {
        if (!isResolved) {
          reject(new Error(`Function ${label} timed out`));
        }
      }, timeout);
    });
  } catch (e) {
    await Logger.warning({
      message: 'promise_timeout_error',
      label,
      error: {
        message: e.message,
        stacK: e.stack,
      },
    });

    if (functions.length > 2) {
      return promiseTimeout(functions.slice(1), timeout, label);
    } else if (functions.length > 1) {
      const fallbackFunc = functions[1];
      return fallbackFunc();
    }

    throw e;
  }
}
