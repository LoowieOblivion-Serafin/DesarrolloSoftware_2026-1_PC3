import type { Proposal } from '../../../domain/Proposal.js';
import type { Signature } from '../../../domain/Signature.js';
import type { Comment } from '../../../domain/Comment.js';
import type { ProposalState } from '../ProposalState.js';
import { FrozenState } from './FrozenState.js';
import { ExpiredState } from './ExpiredState.js';

export class ActiveState implements ProposalState {
  readonly name = 'Active' as const;

  activate(_p: Proposal, _now: Date): void {
    throw new Error('Propuesta ya activa.');
  }

  addSignature(p: Proposal, s: Signature, now: Date): void {
    if (p.deadlineReached(now)) {
      p.setState(new ExpiredState());
      p.notify({ event: 'EXPIRED', proposalId: p.id, timestamp: now });
      throw new Error('Plazo de 90 días vencido. Propuesta expirada.');
    }
    if (p.hasSignedDni(s.citizenDni)) {
      throw new Error(`DNI ${s.citizenDni} ya firmó esta propuesta.`);
    }
    p.signatures.push(s);
    p.notify({
      event: 'SIGNATURE_ADDED',
      proposalId: p.id,
      timestamp: now,
      data: { count: p.signatureCount() }
    });
    if (p.isThresholdReached()) {
      p.notify({ event: 'THRESHOLD_REACHED', proposalId: p.id, timestamp: now });
    }
  }

  addComment(p: Proposal, c: Comment): void {
    p.comments.push(c);
  }

  freeze(p: Proposal, hash: string, signedHash: string, now: Date): void {
    if (!p.isThresholdReached()) {
      throw new Error('No se puede congelar sin alcanzar las 25,000 firmas.');
    }
    p.frozenHash = hash;
    p.frozenSignedHash = signedHash;
    p.frozenAt = now;
    p.setState(new FrozenState());
    p.notify({
      event: 'FROZEN',
      proposalId: p.id,
      timestamp: now,
      data: { hash, signedHash }
    });
  }

  expire(p: Proposal, now: Date): void {
    if (!p.deadlineReached(now)) {
      throw new Error('Plazo aún no vencido.');
    }
    p.setState(new ExpiredState());
    p.notify({ event: 'EXPIRED', proposalId: p.id, timestamp: now });
  }

  distribute(_p: Proposal, _now: Date): void {
    throw new Error('Propuesta debe estar congelada antes de distribuir.');
  }

  allowsResourceModification(): boolean {
    return false;
  }
}
