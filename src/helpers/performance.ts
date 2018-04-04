let pending = 0;

const isTesting = process.env.NODE_ENV === 'testing';

export class Performance {
  protected id: string;
  protected startedAt: number;

  constructor(id: string, log: boolean = true) {
    if (isTesting) {
      return;
    }

    this.id = id;
    this.startedAt = Date.now();

    log === true && console.info('  '.repeat(pending * 2) + `Started: "${id}"`);

    pending++;
  }

  public finish(log: boolean = true) {
    if (isTesting) {
      return;
    }

    const finishedAt = Date.now();
    const diff = finishedAt - this.startedAt;

    pending--;

    log === true &&
      console.info(
        '  '.repeat(pending * 2) + `Finished: "${this.id}" after ${diff}ms\n`,
      );

    return diff;
  }
}
