export interface CompressionInterface {
  getSuffix(): string;
  compress(requestBufffer: string | Buffer): Promise<string | Buffer>;
  decompress(requestBufffer: Buffer): Promise<Buffer>;
}
