import * as zlib from 'zlib';
import { CompressionInterface } from '../compression.interface';

export class GzipCompression implements CompressionInterface {
  /** 1 - 9 */
  protected quality: number = zlib.constants.Z_BEST_SPEED;

  public getSuffix(): string {
    return '_GZIP';
  }

  public setQuality(quality: number) {
    this.quality = quality;
  }

  public async compress(
    requestBufffer: string | Buffer,
  ): Promise<string | Buffer> {
    const compressedBuffer = await new Promise<Buffer>((resolve, reject) => {
      zlib.gzip(
        requestBufffer,
        {
          level: this.quality,
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
      zlib.unzip(requestBufffer, (err, buffer) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(buffer);
      });
    });
  }
}
