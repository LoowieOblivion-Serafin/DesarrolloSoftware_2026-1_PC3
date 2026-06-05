import type { Signature } from '../../domain/Signature.js';
import type { Proposal } from '../../domain/Proposal.js';
import type { SignatureService } from './AuditDecorator.js';
import type { ValidationHandler } from '../behavioral/SignatureValidationChain.js';

export class CoreSignatureService implements SignatureService {
  submit(proposal: Proposal, sig: Signature, now: Date = new Date()): void {
    proposal.addSignature(sig, now);
  }
}

export class SignatureProxy implements SignatureService {
  constructor(
    private inner: SignatureService,
    private validationChain: ValidationHandler,
    private requiredRole: 'CITIZEN' | 'COLLECTIVE' = 'CITIZEN'
  ) {}

  submit(proposal: Proposal, sig: Signature, now: Date = new Date()): void {
    const r = this.validationChain.handle({ proposal, signature: sig });
    if (!r.ok) {
      throw new Error(`Firma rechazada en paso ${r.stepName}: ${r.reason}`);
    }
    this.inner.submit(proposal, sig, now);
  }
}
