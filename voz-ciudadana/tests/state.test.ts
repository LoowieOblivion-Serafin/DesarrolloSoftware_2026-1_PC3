import { describe, it, expect } from 'vitest';
import { Proposal } from '../src/domain/Proposal.js';
import { TEST_COLLECTIVE, makeSig } from './helpers.js';
import { DEADLINE_DAYS, MS_PER_DAY } from '../src/domain/constants.js';

describe('State Pattern — Proposal lifecycle', () => {
  it('RF-5: Draft no acepta firmas', () => {
    const p = new Proposal('P1', 'T', 'B', TEST_COLLECTIVE);
    expect(() => p.addSignature(makeSig(1, 'P1'))).toThrow(/Draft/);
  });

  it('RF-5: Draft -> Active al activar', () => {
    const p = new Proposal('P1', 'T', 'B', TEST_COLLECTIVE);
    p.activate();
    expect(p.getState().name).toBe('Active');
    expect(p.activatedAt).not.toBeNull();
  });

  it('RF-3: Active acepta firmas válidas', () => {
    const p = new Proposal('P1', 'T', 'B', TEST_COLLECTIVE);
    p.activate();
    p.addSignature(makeSig(1, 'P1'));
    expect(p.signatureCount()).toBe(1);
  });

  it('RF-3: No permite DNI duplicado en mismo Proposal vía estado', () => {
    const p = new Proposal('P1', 'T', 'B', TEST_COLLECTIVE);
    p.activate();
    p.addSignature(makeSig(1, 'P1'));
    expect(() => p.addSignature(makeSig(1, 'P1'))).toThrow(/duplicad|ya firmó/i);
  });

  it('RF-5: tras 90+ días pasa a Expired al intentar firmar', () => {
    const p = new Proposal('P1', 'T', 'B', TEST_COLLECTIVE);
    const start = new Date('2026-01-01T00:00:00Z');
    p.activate(start);
    const past = new Date(start.getTime() + (DEADLINE_DAYS + 1) * MS_PER_DAY);
    expect(() => p.addSignature(makeSig(1, 'P1'), past)).toThrow(/vencido|Expired|expir/i);
    expect(p.getState().name).toBe('Expired');
  });

  it('RF-6: no se puede congelar sin alcanzar umbral', () => {
    const p = new Proposal('P1', 'T', 'B', TEST_COLLECTIVE);
    p.activate();
    p.addSignature(makeSig(1, 'P1'));
    expect(() => p.freeze('h', 's')).toThrow(/25,000/);
  });

  it('Frozen no acepta firmas ni comentarios', () => {
    const p = new Proposal('P1', 'T', 'B', TEST_COLLECTIVE);
    p.activate();
    for (let i = 0; i < 25_000; i++) p.addSignature(makeSig(i, 'P1'));
    p.freeze('hash', 'sign');
    expect(p.getState().name).toBe('Frozen');
    expect(() => p.addSignature(makeSig(25_001, 'P1'))).toThrow();
  });

  it('Frozen -> Distributed', () => {
    const p = new Proposal('P1', 'T', 'B', TEST_COLLECTIVE);
    p.activate();
    for (let i = 0; i < 25_000; i++) p.addSignature(makeSig(i, 'P1'));
    p.freeze('hash', 'sign');
    p.distribute();
    expect(p.getState().name).toBe('Distributed');
  });
});
