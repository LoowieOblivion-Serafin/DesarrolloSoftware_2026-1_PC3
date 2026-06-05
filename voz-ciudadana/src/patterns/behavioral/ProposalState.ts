import type { Proposal } from '../../domain/Proposal.js';
import type { Signature } from '../../domain/Signature.js';
import type { Comment } from '../../domain/Comment.js';

export type ProposalStateName = 'Draft' | 'Active' | 'Frozen' | 'Expired' | 'Distributed';

export interface ProposalState {
  readonly name: ProposalStateName;
  activate(p: Proposal, now: Date): void;
  addSignature(p: Proposal, s: Signature, now: Date): void;
  addComment(p: Proposal, c: Comment): void;
  freeze(p: Proposal, hash: string, signedHash: string, now: Date): void;
  expire(p: Proposal, now: Date): void;
  distribute(p: Proposal, now: Date): void;
  allowsResourceModification(): boolean;
}
