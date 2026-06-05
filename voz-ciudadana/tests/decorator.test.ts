import { describe, it, expect } from 'vitest';
import {
  AuditDecorator,
  RateLimitDecorator,
  type SignatureService
} from '../src/patterns/structural/AuditDecorator.js';
import { Proposal } from '../src/domain/Proposal.js';
import { TEST_COLLECTIVE, makeSig, makeSigWithDni } from './helpers.js';

class FakeService implements SignatureService {
  public calls = 0;
  submit(): void {
    this.calls++;
  }
}

describe('Decorator Pattern', () => {
  it('AuditDecorator registra OK', () => {
    const inner = new FakeService();
    const audit = new AuditDecorator(inner);
    const p = new Proposal('P', 'T', 'B', TEST_COLLECTIVE);
    audit.submit(p, makeSig(1, 'P'));
    expect(audit.getLog().length).toBe(1);
    expect(audit.getLog()[0].outcome).toBe('OK');
  });

  it('AuditDecorator registra ERROR y re-lanza', () => {
    const inner: SignatureService = {
      submit: () => { throw new Error('boom'); }
    };
    const audit = new AuditDecorator(inner);
    const p = new Proposal('P', 'T', 'B', TEST_COLLECTIVE);
    expect(() => audit.submit(p, makeSig(1, 'P'))).toThrow('boom');
    expect(audit.getLog()[0].outcome).toBe('ERROR');
  });

  it('RateLimitDecorator bloquea excesos', () => {
    const inner = new FakeService();
    const rl = new RateLimitDecorator(inner, 2);
    const p = new Proposal('P', 'T', 'B', TEST_COLLECTIVE);
    const now = new Date();
    rl.submit(p, makeSigWithDni('12345678', 'P', 0), now);
    rl.submit(p, makeSigWithDni('12345678', 'P', 1), now);
    expect(() => rl.submit(p, makeSigWithDni('12345678', 'P', 2), now)).toThrow(/Rate limit/);
  });
});
