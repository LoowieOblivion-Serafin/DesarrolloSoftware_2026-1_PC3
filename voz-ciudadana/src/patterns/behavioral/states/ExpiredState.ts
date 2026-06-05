import type { Proposal } from '../../../domain/Proposal.js';
import type { Signature } from '../../../domain/Signature.js';
import type { Comment } from '../../../domain/Comment.js';
import type { ProposalState } from '../ProposalState.js';

export class ExpiredState implements ProposalState {
  readonly name = 'Expired' as const;

  activate(_p: Proposal, _now: Date): void {
    throw new Error('Propuesta expirada no puede reactivarse.');
  }

  addSignature(_p: Proposal, _s: Signature, _now: Date): void {
    throw new Error('Propuesta expirada no acepta firmas.');
  }

  addComment(_p: Proposal, _c: Comment): void {
    throw new Error('Propuesta expirada no acepta comentarios.');
  }

  freeze(_p: Proposal, _h: string, _s: string, _now: Date): void {
    throw new Error('Propuesta expirada no puede congelarse.');
  }

  expire(_p: Proposal, _now: Date): void {
    throw new Error('Propuesta ya expirada.');
  }

  distribute(_p: Proposal, _now: Date): void {
    throw new Error('Propuesta expirada no puede distribuirse.');
  }

  allowsResourceModification(): boolean {
    return false;
  }
}
