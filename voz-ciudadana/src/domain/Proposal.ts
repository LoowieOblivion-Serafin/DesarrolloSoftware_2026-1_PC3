import type { Signature } from './Signature.js';
import type { Comment } from './Comment.js';
import type { Collective } from './Collective.js';
import type { ResourceComponent } from '../patterns/structural/CompositeResource.js';
import type { ProposalState } from '../patterns/behavioral/ProposalState.js';
import { DraftState } from '../patterns/behavioral/states/DraftState.js';
import { Observer, Subject } from '../patterns/behavioral/Observer.js';
import { DEADLINE_DAYS, MS_PER_DAY, SIGNATURE_THRESHOLD } from './constants.js';

export type ProposalEvent =
  | 'STATE_CHANGED'
  | 'SIGNATURE_ADDED'
  | 'COMMENT_ADDED'
  | 'THRESHOLD_REACHED'
  | 'FROZEN'
  | 'EXPIRED'
  | 'DISTRIBUTED';

export interface ProposalEventPayload {
  event: ProposalEvent;
  proposalId: string;
  timestamp: Date;
  data?: Record<string, unknown>;
}

export class Proposal implements Subject<ProposalEventPayload> {
  readonly id: string;
  title: string;
  body: string;
  readonly owner: Collective;
  readonly createdAt: Date;
  activatedAt: Date | null = null;
  resources: ResourceComponent[] = [];
  signatures: Signature[] = [];
  comments: Comment[] = [];
  frozenHash: string | null = null;
  frozenSignedHash: string | null = null;
  frozenAt: Date | null = null;
  distributedAt: Date | null = null;

  private state: ProposalState;
  private observers: Observer<ProposalEventPayload>[] = [];

  constructor(id: string, title: string, body: string, owner: Collective) {
    this.id = id;
    this.title = title;
    this.body = body;
    this.owner = owner;
    this.createdAt = new Date();
    this.state = new DraftState();
  }

  getState(): ProposalState {
    return this.state;
  }

  setState(state: ProposalState): void {
    this.state = state;
    this.notify({
      event: 'STATE_CHANGED',
      proposalId: this.id,
      timestamp: new Date(),
      data: { stateName: state.name }
    });
  }

  activate(now: Date = new Date()): void {
    this.state.activate(this, now);
  }

  addSignature(sig: Signature, now: Date = new Date()): void {
    this.state.addSignature(this, sig, now);
  }

  addComment(c: Comment): void {
    this.state.addComment(this, c);
  }

  freeze(hash: string, signedHash: string, now: Date = new Date()): void {
    this.state.freeze(this, hash, signedHash, now);
  }

  expire(now: Date = new Date()): void {
    this.state.expire(this, now);
  }

  distribute(now: Date = new Date()): void {
    this.state.distribute(this, now);
  }

  attachResource(r: ResourceComponent): void {
    if (this.state.allowsResourceModification()) {
      this.resources.push(r);
    } else {
      throw new Error(`No se puede adjuntar recurso en estado ${this.state.name}`);
    }
  }

  signatureCount(): number {
    return this.signatures.length;
  }

  isThresholdReached(): boolean {
    return this.signatureCount() >= SIGNATURE_THRESHOLD;
  }

  deadlineReached(now: Date): boolean {
    if (!this.activatedAt) return false;
    const diff = now.getTime() - this.activatedAt.getTime();
    return diff > DEADLINE_DAYS * MS_PER_DAY;
  }

  daysRemaining(now: Date = new Date()): number {
    if (!this.activatedAt) return DEADLINE_DAYS;
    const elapsedMs = now.getTime() - this.activatedAt.getTime();
    const remainingMs = DEADLINE_DAYS * MS_PER_DAY - elapsedMs;
    return Math.max(0, Math.ceil(remainingMs / MS_PER_DAY));
  }

  hasSignedDni(dni: string): boolean {
    return this.signatures.some((s) => s.citizenDni === dni);
  }

  attach(o: Observer<ProposalEventPayload>): void {
    this.observers.push(o);
  }

  detach(o: Observer<ProposalEventPayload>): void {
    this.observers = this.observers.filter((x) => x !== o);
  }

  notify(payload: ProposalEventPayload): void {
    for (const o of this.observers) o.update(payload);
  }

  canonicalize(): string {
    const sortedSigs = [...this.signatures]
      .map((s) => ({ d: s.citizenDni, t: s.timestamp.toISOString(), h: s.hash }))
      .sort((a, b) => (a.d < b.d ? -1 : 1));
    return JSON.stringify({
      id: this.id,
      title: this.title,
      body: this.body,
      owner: this.owner.id,
      signatures: sortedSigs,
      resources: this.resources.map((r) => r.serialize())
    });
  }
}
