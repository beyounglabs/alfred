export class HttpError extends Error{
  protected status: number;

  constructor(status: number, error: string){
    super(error);
    this.status = status;
  }
}
