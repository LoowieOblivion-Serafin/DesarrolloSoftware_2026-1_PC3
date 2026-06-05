import { describe, it, expect } from 'vitest';
import {
  DniRENIECStrategy,
  DigitalCertStrategy,
  BiometricStrategy,
  SignatureValidator
} from '../src/patterns/behavioral/SignatureValidationStrategy.js';
import type { Signature } from '../src/domain/Signature.js';

describe('Strategy Pattern — Validación firmas', () => {
  const validator = new SignatureValidator();
  validator.register(new DniRENIECStrategy());
  validator.register(new DigitalCertStrategy());
  validator.register(new BiometricStrategy());

  it('DNI RENIEC válido pasa', () => {
    const s: Signature = {
      signatureId: 'S', citizenDni: '12345678', proposalId: 'P',
      timestamp: new Date(), method: 'DNI_RENIEC', hash: 'x'.repeat(40)
    };
    expect(validator.validate(s)).toBe(true);
  });

  it('DNI inválido falla en DNI_RENIEC', () => {
    const s: Signature = {
      signatureId: 'S', citizenDni: 'abc', proposalId: 'P',
      timestamp: new Date(), method: 'DNI_RENIEC', hash: 'x'.repeat(40)
    };
    expect(validator.validate(s)).toBe(false);
  });

  it('Cert digital requiere hash largo', () => {
    const s: Signature = {
      signatureId: 'S', citizenDni: '12345678', proposalId: 'P',
      timestamp: new Date(), method: 'DIGITAL_CERT', hash: 'short'
    };
    expect(validator.validate(s)).toBe(false);
  });

  it('Biométrico requiere prefijo bio-', () => {
    const s: Signature = {
      signatureId: 'S', citizenDni: '12345678', proposalId: 'P',
      timestamp: new Date(), method: 'BIOMETRIC', hash: 'bio-abc123'
    };
    expect(validator.validate(s)).toBe(true);
  });

  it('Estrategia no registrada lanza error', () => {
    const v = new SignatureValidator();
    const s: Signature = {
      signatureId: 'S', citizenDni: '12345678', proposalId: 'P',
      timestamp: new Date(), method: 'DNI_RENIEC', hash: 'x'
    };
    expect(() => v.validate(s)).toThrow(/no registrada/);
  });
});
