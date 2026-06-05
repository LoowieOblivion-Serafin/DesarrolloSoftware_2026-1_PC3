import type { Proposal } from '../../../domain/Proposal.js';
import type { Signature } from '../../../domain/Signature.js';
import type { Comment } from '../../../domain/Comment.js';
import type { ProposalState } from '../ProposalState.js';

export class DistributedState implements ProposalState {
  readonly name = 'Distributed' as const;

  activate(_p: Proposal, _now: Date): void {
    throw new Error('Propuesta ya distribuida al Congreso.');
  }

  addSignature(_p: Proposal, _s: Signature, _now: Date): void {
    throw new Error('Propuesta distribuida no acepta firmas.');
  }

  addComment(_p: Proposal, _c: Comment): void {
    throw new Error('Propuesta distribuida no acepta comentarios.');
  }

  freeze(_p: Proposal, _h: string, _s: string, _now: Date): void {
    throw new Error('Propuesta ya distribuida.');
  }

  expire(_p: Proposal, _now: Date): void {
    throw new Error('Propuesta distribuida no puede expirar.');
  }

  distribute(_p: Proposal, _now: Date): void {
    throw new Error('Propuesta ya distribuida.');
  }

  allowsResourceModification(): boolean {
    return false;
  }
}
