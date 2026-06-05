import type { Proposal } from '../../../domain/Proposal.js';
import type { Signature } from '../../../domain/Signature.js';
import type { Comment } from '../../../domain/Comment.js';
import type { ProposalState } from '../ProposalState.js';
import { DistributedState } from './DistributedState.js';

export class FrozenState implements ProposalState {
  readonly name = 'Frozen' as const;

  activate(_p: Proposal, _now: Date): void {
    throw new Error('Propuesta congelada no puede reactivarse.');
  }

  addSignature(_p: Proposal, _s: Signature, _now: Date): void {
    throw new Error('Propuesta congelada no acepta más firmas.');
  }

  addComment(_p: Proposal, _c: Comment): void {
    throw new Error('Propuesta congelada no acepta comentarios.');
  }

  freeze(_p: Proposal, _h: string, _s: string, _now: Date): void {
    throw new Error('Propuesta ya congelada.');
  }

  expire(_p: Proposal, _now: Date): void {
    throw new Error('Propuesta congelada no puede expirar.');
  }

  distribute(p: Proposal, now: Date): void {
    p.distributedAt = now;
    p.setState(new DistributedState());
    p.notify({ event: 'DISTRIBUTED', proposalId: p.id, timestamp: now });
  }

  allowsResourceModification(): boolean {
    return false;
  }
}
