import type { Observer } from '../patterns/behavioral/Observer.js';
import type { ProposalEventPayload } from '../domain/Proposal.js';

export class CollectiveNotifier implements Observer<ProposalEventPayload> {
  public received: ProposalEventPayload[] = [];
  constructor(public collectiveId: string) {}
  update(p: ProposalEventPayload): void {
    this.received.push(p);
  }
}

export class CongressNotifier implements Observer<ProposalEventPayload> {
  public received: ProposalEventPayload[] = [];
  update(p: ProposalEventPayload): void {
    if (p.event === 'FROZEN' || p.event === 'DISTRIBUTED') {
      this.received.push(p);
    }
  }
}

export class CitizenBroadcaster implements Observer<ProposalEventPayload> {
  public received: ProposalEventPayload[] = [];
  update(p: ProposalEventPayload): void {
    if (p.event === 'STATE_CHANGED' || p.event === 'THRESHOLD_REACHED') {
      this.received.push(p);
    }
  }
}
