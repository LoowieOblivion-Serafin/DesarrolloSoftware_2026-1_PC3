import { createHash, createHmac } from 'node:crypto';

export class CryptoService {
  constructor(private secret: string = 'voz-ciudadana-secret-2026') {}

  sha256(payload: string): string {
    return createHash('sha256').update(payload).digest('hex');
  }

  hmacSign(payload: string): string {
    return createHmac('sha256', this.secret).update(payload).digest('hex');
  }

  verify(payload: string, signedHash: string): boolean {
    return this.hmacSign(payload) === signedHash;
  }

  timestamp(): string {
    return new Date().toISOString();
  }
}
