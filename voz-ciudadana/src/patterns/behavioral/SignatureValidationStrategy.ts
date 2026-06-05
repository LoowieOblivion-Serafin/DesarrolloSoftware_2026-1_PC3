import type { Signature, ValidationMethod } from '../../domain/Signature.js';

export interface SignatureValidationStrategy {
  method: ValidationMethod;
  validate(s: Signature): boolean;
}

export class DniRENIECStrategy implements SignatureValidationStrategy {
  method: ValidationMethod = 'DNI_RENIEC';
  validate(s: Signature): boolean {
    return /^[0-9]{8}$/.test(s.citizenDni);
  }
}

export class DigitalCertStrategy implements SignatureValidationStrategy {
  method: ValidationMethod = 'DIGITAL_CERT';
  validate(s: Signature): boolean {
    return s.hash.length >= 32;
  }
}

export class BiometricStrategy implements SignatureValidationStrategy {
  method: ValidationMethod = 'BIOMETRIC';
  validate(s: Signature): boolean {
    return s.hash.startsWith('bio-');
  }
}

export class SignatureValidator {
  private strategies = new Map<ValidationMethod, SignatureValidationStrategy>();

  register(s: SignatureValidationStrategy): void {
    this.strategies.set(s.method, s);
  }

  validate(sig: Signature): boolean {
    const strat = this.strategies.get(sig.method);
    if (!strat) throw new Error(`Estrategia no registrada: ${sig.method}`);
    return strat.validate(sig);
  }
}
