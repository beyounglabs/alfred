import { CompressionInterface } from '../compression.interface';

export class NoCompression implements CompressionInterface {
  public getSuffix(): string {
    return '';
  }

  public async compress(
    requestBufffer: string | Buffer,
  ): Promise<string | Buffer> {
    return requestBufffer;
  }

  public async decompress(requestBufffer: Buffer): Promise<Buffer> {
    return requestBufffer;
  }
}
