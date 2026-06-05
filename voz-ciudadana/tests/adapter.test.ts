import { describe, it, expect } from 'vitest';
import {
  LegacyRENIECAdapter,
  SoapCongressAdapter,
  FakeRENIEC,
  FakeCongress
} from '../src/patterns/structural/Adapters.js';

describe('Adapter Pattern', () => {
  it('LegacyRENIECAdapter traduce respuesta', () => {
    const adapter = new LegacyRENIECAdapter({
      ConsultarDocumentoIdentidad: ({ num }) => ({
        exists: num === '12345678',
        status: 'ACTIVE'
      })
    });
    expect(adapter.checkDni('12345678')).toBe(true);
    expect(adapter.checkDni('99999999')).toBe(false);
  });

  it('SoapCongressAdapter genera XML y devuelve recibo', async () => {
    const adapter = new SoapCongressAdapter({
      EnviarExpediente_v2: ({ xml }) => {
        expect(xml).toContain('expediente');
        return { codigo: 'R-001', ok: true };
      }
    });
    const r = await adapter.distribute({
      proposalId: 'P1',
      title: 'T',
      hash: 'h',
      signedHash: 's',
      signatureCount: 25_000,
      frozenAt: '2026-01-01T00:00:00Z'
    });
    expect(r.receipt).toBe('R-001');
  });

  it('SoapCongressAdapter lanza si Congreso rechaza', async () => {
    const adapter = new SoapCongressAdapter({
      EnviarExpediente_v2: () => ({ codigo: '', ok: false })
    });
    await expect(adapter.distribute({
      proposalId: 'P1', title: 'T', hash: 'h', signedHash: 's',
      signatureCount: 1, frozenAt: ''
    })).rejects.toThrow(/rechazó/);
  });

  it('FakeRENIEC rechaza DNI en lista inválida', () => {
    const r = new FakeRENIEC(new Set(['11111111']));
    expect(r.checkDni('12345678')).toBe(true);
    expect(r.checkDni('11111111')).toBe(false);
  });

  it('FakeCongress almacena envelopes recibidos', async () => {
    const c = new FakeCongress();
    await c.distribute({
      proposalId: 'P', title: 'T', hash: 'h', signedHash: 's',
      signatureCount: 1, frozenAt: ''
    });
    expect(c.received.length).toBe(1);
  });
});
