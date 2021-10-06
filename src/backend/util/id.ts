import * as crypto from 'crypto';

export class IDUtil {
  static create(): string {
    return crypto
      .createHash('sha256')
      .update(Date.now() + crypto.randomBytes(8).toString())
      .digest('hex');
  }
}
