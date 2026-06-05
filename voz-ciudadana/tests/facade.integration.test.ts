import { describe, it, expect } from 'vitest';
import { VozCiudadanaFacade } from '../src/services/VozCiudadanaFacade.js';
import { FakeRENIEC, FakeCongress } from '../src/patterns/structural/Adapters.js';
import { TEST_COLLECTIVE, makeSig } from './helpers.js';
import { SIGNATURE_THRESHOLD, DEADLINE_DAYS, MS_PER_DAY } from '../src/domain/constants.js';
import {
  DocumentLeaf,
  FolderComposite
} from '../src/patterns/structural/CompositeResource.js';

describe('Facade — Integración end-to-end', () => {
  function buildFacade() {
    return new VozCiudadanaFacade({
      reniec: new FakeRENIEC(),
      congress: new FakeCongress(),
      rateLimitPerMinute: 100_000
    });
  }

  it('flujo feliz: crear -> activar -> firmar 25k -> auto-congelar -> distribuir', async () => {
    const f = buildFacade();
    const p = f.createProposal('P1', 'T', 'B', TEST_COLLECTIVE);
    const folder = new FolderComposite('exp');
    folder.add(new DocumentLeaf('a.pdf', 1024));
    f.attachResource('P1', folder);
    f.activateProposal('P1');
    for (let i = 0; i < SIGNATURE_THRESHOLD; i++) f.sign('P1', makeSig(i, 'P1'));
    expect(p.getState().name).toBe('Frozen');
    expect(p.frozenHash).toBeTruthy();
    expect(f.verifyFrozenIntegrity('P1')).toBe(true);
    const receipt = await f.distributeToCongress('P1');
    expect(receipt).toMatch(/CONG-/);
    expect(p.getState().name).toBe('Distributed');
  });

  it('RF-6: hash determinístico (mismo contenido = mismo hash)', () => {
    const f1 = buildFacade();
    const f2 = buildFacade();
    const fixedDate = new Date('2026-01-01T00:00:00Z');
    const p1 = f1.createProposal('P', 'T', 'B', TEST_COLLECTIVE);
    const p2 = f2.createProposal('P', 'T', 'B', TEST_COLLECTIVE);
    f1.activateProposal('P', fixedDate);
    f2.activateProposal('P', fixedDate);
    for (let i = 0; i < SIGNATURE_THRESHOLD; i++) {
      const sig = { ...makeSig(i, 'P'), timestamp: fixedDate };
      f1.sign('P', sig, fixedDate);
      f2.sign('P', sig, fixedDate);
    }
    expect(p1.frozenHash).toBe(p2.frozenHash);
  });

  it('proxy rechaza DNI con formato inválido', () => {
    const f = buildFacade();
    f.createProposal('P', 'T', 'B', TEST_COLLECTIVE);
    f.activateProposal('P');
    const bad = { ...makeSig(1, 'P'), citizenDni: 'XYZ' };
    expect(() => f.sign('P', bad)).toThrow(/Format/);
  });

  it('RNF-3: audit log registra firmas OK y ERROR', () => {
    const f = buildFacade();
    f.createProposal('P', 'T', 'B', TEST_COLLECTIVE);
    f.activateProposal('P');
    f.sign('P', makeSig(1, 'P'));
    try { f.sign('P', makeSig(1, 'P')); } catch { /* duplicado esperado */ }
    const log = f.getAuditLog();
    expect(log.some((l) => l.outcome === 'OK')).toBe(true);
    expect(log.some((l) => l.outcome === 'ERROR')).toBe(true);
  });

  it('no puede distribuir sin congelar', async () => {
    const f = buildFacade();
    f.createProposal('P', 'T', 'B', TEST_COLLECTIVE);
    f.activateProposal('P');
    await expect(f.distributeToCongress('P')).rejects.toThrow(/congelada/);
  });

  it('RF-5: expira al pasar 90+ días sin alcanzar 25k', () => {
    const f = buildFacade();
    const p = f.createProposal('P', 'T', 'B', TEST_COLLECTIVE);
    const start = new Date('2026-01-01T00:00:00Z');
    f.activateProposal('P', start);
    f.sign('P', makeSig(1, 'P'), start);
    const later = new Date(start.getTime() + (DEADLINE_DAYS + 2) * MS_PER_DAY);
    expect(() => f.sign('P', makeSig(2, 'P'), later)).toThrow();
    expect(p.getState().name).toBe('Expired');
  });

  it('integridad falla si frozenHash es manipulado', () => {
    const f = buildFacade();
    const p = f.createProposal('P', 'T', 'B', TEST_COLLECTIVE);
    f.activateProposal('P');
    for (let i = 0; i < SIGNATURE_THRESHOLD; i++) f.sign('P', makeSig(i, 'P'));
    p.frozenHash = 'tampered';
    expect(f.verifyFrozenIntegrity('P')).toBe(false);
  });
});
