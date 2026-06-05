import type { Signature } from '../src/domain/Signature.js';
import type { Collective } from '../src/domain/Collective.js';

export const TEST_COLLECTIVE: Collective = {
  id: 'COL-T',
  name: 'Colectivo Test',
  legalRepresentative: 'Tester',
  contactEmail: 't@t.pe'
};

export function makeSig(i: number, proposalId: string, method: Signature['method'] = 'DNI_RENIEC'): Signature {
  const dni = (10_000_000 + i).toString().padStart(8, '0');
  return {
    signatureId: `SIG-${i}`,
    citizenDni: dni,
    proposalId,
    timestamp: new Date(),
    method,
    hash: 'x'.repeat(40)
  };
}

export function makeSigWithDni(dni: string, proposalId: string, idx = 0): Signature {
  return {
    signatureId: `SIG-${dni}-${idx}`,
    citizenDni: dni,
    proposalId,
    timestamp: new Date(),
    method: 'DNI_RENIEC',
    hash: 'x'.repeat(40)
  };
}
