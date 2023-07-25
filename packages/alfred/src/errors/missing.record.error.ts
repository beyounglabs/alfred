export class MissingRecordError extends Error {
  protected status: number;

  constructor(error: string) {
    super(error);
    this.status = 404;
  }
}
