import { describe, it, expect } from 'vitest';
import { CryptoService } from '../src/services/CryptoService.js';

describe('CryptoService', () => {
  it('SHA-256 determinístico', () => {
    const c = new CryptoService();
    expect(c.sha256('abc')).toBe(c.sha256('abc'));
    expect(c.sha256('abc')).not.toBe(c.sha256('abd'));
  });

  it('HMAC sign + verify', () => {
    const c = new CryptoService('secret-x');
    const sig = c.hmacSign('payload');
    expect(c.verify('payload', sig)).toBe(true);
    expect(c.verify('payload-tampered', sig)).toBe(false);
  });

  it('HMAC con secreto distinto produce firma distinta', () => {
    const a = new CryptoService('s1').hmacSign('x');
    const b = new CryptoService('s2').hmacSign('x');
    expect(a).not.toBe(b);
  });
});
