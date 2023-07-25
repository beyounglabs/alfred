let pending = 0;

const isTesting = process.env.NODE_ENV === 'testing';

export class Performance {
  protected id: string;
  protected startedAt: number;
  protected shouldLog: boolean;

  constructor(id: string, shouldLog: boolean = true) {
    if (isTesting) {
      return;
    }

    this.id = id;
    this.startedAt = Date.now();
    this.shouldLog = shouldLog;

    shouldLog === true && console.info('  '.repeat(pending * 2) + `${id}`);

    pending++;
  }

  public finish() {
    if (isTesting) {
      return;
    }

    const finishedAt = Date.now();
    const diff = finishedAt - this.startedAt;

    pending--;

    this.shouldLog === true &&
      console.info('  '.repeat(pending * 2) + `/${this.id} after ${diff}ms\n`);

    return diff;
  }
}
