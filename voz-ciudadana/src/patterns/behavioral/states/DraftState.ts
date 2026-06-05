import type { Proposal } from '../../../domain/Proposal.js';
import type { Signature } from '../../../domain/Signature.js';
import type { Comment } from '../../../domain/Comment.js';
import type { ProposalState } from '../ProposalState.js';
import { ActiveState } from './ActiveState.js';

export class DraftState implements ProposalState {
  readonly name = 'Draft' as const;

  activate(p: Proposal, now: Date): void {
    p.activatedAt = now;
    p.setState(new ActiveState());
  }

  addSignature(_p: Proposal, _s: Signature, _now: Date): void {
    throw new Error('No se pueden recolectar firmas en estado Draft.');
  }

  addComment(p: Proposal, c: Comment): void {
    p.comments.push(c);
  }

  freeze(_p: Proposal, _h: string, _s: string, _now: Date): void {
    throw new Error('No se puede congelar una propuesta en estado Draft.');
  }

  expire(_p: Proposal, _now: Date): void {
    throw new Error('Propuesta en Draft no puede expirar.');
  }

  distribute(_p: Proposal, _now: Date): void {
    throw new Error('Propuesta en Draft no puede distribuirse.');
  }

  allowsResourceModification(): boolean {
    return true;
  }
}
