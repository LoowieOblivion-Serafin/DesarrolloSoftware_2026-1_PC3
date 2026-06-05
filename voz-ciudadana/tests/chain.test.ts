import { describe, it, expect } from 'vitest';
import { buildDefaultChain } from '../src/patterns/behavioral/SignatureValidationChain.js';
import { Proposal } from '../src/domain/Proposal.js';
import { TEST_COLLECTIVE, makeSigWithDni } from './helpers.js';

describe('Chain of Responsibility — Validación firmas', () => {
  it('formato inválido se rechaza primero', () => {
    const chain = buildDefaultChain(new Set(), () => true);
    const p = new Proposal('P', 'T', 'B', TEST_COLLECTIVE);
    p.activate();
    const r = chain.handle({ proposal: p, signature: makeSigWithDni('bad', 'P') });
    expect(r.ok).toBe(false);
    expect(r.stepName).toBe('Format');
  });

  it('DNI duplicado se rechaza', () => {
    const chain = buildDefaultChain(new Set(), () => true);
    const p = new Proposal('P', 'T', 'B', TEST_COLLECTIVE);
    p.activate();
    p.addSignature(makeSigWithDni('12345678', 'P'));
    const r = chain.handle({ proposal: p, signature: makeSigWithDni('12345678', 'P') });
    expect(r.ok).toBe(false);
    expect(r.stepName).toBe('Duplicate');
  });

  it('blacklist rechaza', () => {
    const chain = buildDefaultChain(new Set(['12345678']), () => true);
    const p = new Proposal('P', 'T', 'B', TEST_COLLECTIVE);
    p.activate();
    const r = chain.handle({ proposal: p, signature: makeSigWithDni('12345678', 'P') });
    expect(r.ok).toBe(false);
    expect(r.stepName).toBe('Blacklist');
  });

  it('RENIEC rechaza', () => {
    const chain = buildDefaultChain(new Set(), () => false);
    const p = new Proposal('P', 'T', 'B', TEST_COLLECTIVE);
    p.activate();
    const r = chain.handle({ proposal: p, signature: makeSigWithDni('12345678', 'P') });
    expect(r.ok).toBe(false);
    expect(r.stepName).toBe('RENIEC');
  });

  it('todas las validaciones pasan', () => {
    const chain = buildDefaultChain(new Set(), () => true);
    const p = new Proposal('P', 'T', 'B', TEST_COLLECTIVE);
    p.activate();
    const r = chain.handle({ proposal: p, signature: makeSigWithDni('12345678', 'P') });
    expect(r.ok).toBe(true);
  });
});
