import * as zlib from 'zlib';
import { CompressionInterface } from '../compression.interface';

export class BrotliCompression implements CompressionInterface {
  /** 1 - 10 */
  protected quality: number = 4;

  public setQuality(quality: number) {
    this.quality = quality;
  }

  public getSuffix(): string {
    return '_BROTLI';
  }

  public async compress(requestBufffer: string | Buffer): Promise<Buffer> {
    const compressedBuffer = await new Promise<Buffer>((resolve, reject) => {
      zlib.brotliCompress(
        requestBufffer,
        {
          params: {
            [zlib.constants.BROTLI_PARAM_QUALITY]: this.quality,
          },
        },
        (err, buffer) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(buffer);
        },
      );
    });

    return compressedBuffer;
  }

  public async decompress(requestBufffer: Buffer): Promise<Buffer> {
    return await new Promise<Buffer>((resolve, reject) => {
      zlib.brotliDecompress(requestBufffer, (err, buffer) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(buffer);
      });
    });
  }
}
